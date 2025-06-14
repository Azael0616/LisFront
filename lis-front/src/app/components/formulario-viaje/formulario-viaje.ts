import { Component, EventEmitter, OnInit, Output,Input,ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LisApi } from '../../services/lis-api'
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-formulario-viaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-viaje.html',
  styleUrls: ['./formulario-viaje.css'],
  providers: [DatePipe]
})
export class FormularioViajeComponent implements OnInit {
   @Input() viajeId: number | null = null;
   @Output() viajeAgregado = new EventEmitter<void>();

  formulario!: FormGroup;
  operadores: any[] = [];
  paises : any[] = [];
  estados: any[] = [];
  municipios: any[] = [];
  paisesDestino : any[] = [];
  estadosDestino: any[] = [];
  municipiosDestino: any[] = [];  

  constructor(private fb: FormBuilder, private lisService: LisApi,private cdr: ChangeDetectorRef) { }


  
    limpiarFormulario() {
      this.formulario.reset();
      this.operadores = [];
      this.paises = [];
      this.estados = [];
      this.municipios = [];
      this.paisesDestino = [];
      this.estadosDestino = [];
      this.municipiosDestino = [];
      this.viajeId = null;
  }
  cancelar() {
    this.limpiarFormulario();    
    //Se manda a llamar al metodo onViajeAgregado
    this.viajeAgregado.emit();
  }
  ngOnInit(): void {        
    this.crearFormulario();
    this.cargarCatalogos();    
    if (this.viajeId != null) {
      this.cargarViaje(this.viajeId);
    }
    else{
  //Suscribirse al cambio de país (origen)
  this.formulario.get('origen.PaisID_o')?.valueChanges.subscribe(paisId => {
    if (paisId) {
      this.lisService.obtenerEstados(paisId).subscribe({
        next: (estados) => {
          this.estados = estados;
          this.formulario.get('origen.EstadoID_o')?.reset();  // reseteamos el estado al cambiar el país
          this.municipios = []; // limpiamos los municipios
        }
      });
    }
    });
    // Suscribirse al cambio de estado (origen)
    this.formulario.get('origen.EstadoID_o')?.valueChanges.subscribe(estadoId => {
      if (estadoId) {
        this.lisService.obtenerMunicipios(estadoId).subscribe({
          next: (municipios) => {
          this.municipios = municipios;
          this.formulario.get('origen.MunicipioID_o')?.reset();
          }
        });
      }
    });
    this.formulario.get('destino.PaisID_d')?.valueChanges.subscribe(paisId => {
    if (paisId) {
      this.lisService.obtenerEstados(paisId).subscribe({
        next: (estados) => {
          this.estadosDestino = estados;
          this.formulario.get('destino.EstadoID_d')?.reset();
          this.municipiosDestino = [];
        }
      });
    }
  });

  this.formulario.get('destino.EstadoID_d')?.valueChanges.subscribe(estadoId => {
    if (estadoId) {
      this.lisService.obtenerMunicipios(estadoId).subscribe({
        next: (municipios) => {
          this.municipiosDestino = municipios;
          this.formulario.get('destino.MunicipioID_d')?.reset();
        }
      });
    }
  });
    }    
  }

  //Estructura del formulario
  crearFormulario() {
    this.formulario = this.fb.group({
      origen: this.fb.group({
        Calle_o: ['', Validators.required],
        Colonia_o: ['', Validators.required],
        Numero_exterior_o: ['', Validators.required],
        Numero_interior_o: [''],
        PaisID_o: ['', Validators.required],
        EstadoID_o: ['', Validators.required],
        MunicipioID_o: ['', Validators.required],
      }),
      destino: this.fb.group({
        Calle_d: ['', Validators.required],
        Colonia_d: ['', Validators.required],
        Numero_exterior_d: ['', Validators.required],
        Numero_interior_d: [''],
        PaisID_d: ['', Validators.required],
        EstadoID_d: ['', Validators.required],
        MunicipioID_d: ['', Validators.required],
      }),
      operadorYFechas: this.fb.group({
        OperadorID: ['', Validators.required],
        Fecha_inicio: ['', Validators.required],
        Fecha_fin: ['', Validators.required],
      })
    });
  }
  //Catalogos
  cargarCatalogos(): void {
    this.lisService.obtenerPaises().subscribe({
      next: (data) => { 
        this.paises = data; 
        this.paisesDestino = data;        
      }
    });
    this.lisService.obtenerOperadores().subscribe({
      next: (data) => { 
        this.operadores = data;         
      }
    }); 
  }
  //Informacion del viaje
  cargarViaje(id: number): void {
    this.lisService.obtenerViajePorId(id).subscribe({
      next: (data: any) => {
      // Disparamos en paralelo las 4 peticiones necesarias:
      forkJoin([
        this.lisService.obtenerEstados(data.paisID_o),
        this.lisService.obtenerMunicipios(data.estadoID_o),
        this.lisService.obtenerEstados(data.paisID_d),
        this.lisService.obtenerMunicipios(data.estadoID_d)
      ]).subscribe({
        next: ([estadosOrigen, municipiosOrigen, estadosDestino, municipiosDestino]) => {
          // Cargamos los catálogos ya resueltos
          this.estados = estadosOrigen;
          this.municipios = municipiosOrigen;
          this.estadosDestino = estadosDestino;
          this.municipiosDestino = municipiosDestino;
          //Seteamos la informacion
          this.setearFormulario(data);
        },
        error: (err) => console.error("Error cargando catálogos: ", err)
      });

    },
    error: (err) => console.error("Error cargando datos del viaje: ", err)
  });
}

private setearFormulario(data: any): void {
  // Formateamos las fechas
  const fechaInicio = this.formatearFecha(data.fecha_inicio);
  const fechaFin = this.formatearFecha(data.fecha_fin);  
  this.formulario.patchValue({
    origen: {
      Calle_o: data.calle_o,
      Colonia_o: data.colonia_o,
      Numero_exterior_o: data.numero_exterior_o,
      Numero_interior_o: data.numero_interior_o,
      PaisID_o: data.paisID_o,
      EstadoID_o: data.estadoID_o,
      MunicipioID_o: data.municipioID_o,
    },
    destino: {
      Calle_d: data.calle_d,
      Colonia_d: data.colonia_d,
      Numero_exterior_d: data.numero_exterior_d,
      Numero_interior_d: data.numero_interior_d,
      PaisID_d: data.paisID_d,
      EstadoID_d: data.estadoID_d,
      MunicipioID_d: data.municipioID_d,
    },
    operadorYFechas: {
      OperadorID: data.operadorID,
      Fecha_inicio: fechaInicio,
      Fecha_fin: fechaFin,
    }
  });
  // Suscribirse al cambio de país (origen)
  this.formulario.get('origen.PaisID_o')?.valueChanges.subscribe(paisId => {
    if (paisId) {
      this.lisService.obtenerEstados(paisId).subscribe({
        next: (estados) => {
          this.estados = estados;
          this.formulario.get('origen.EstadoID_o')?.reset();  // reseteamos el estado al cambiar el país
          this.municipios = []; // limpiamos los municipios
        }
      });
    }
    });
    // Suscribirse al cambio de estado (origen)
    this.formulario.get('origen.EstadoID_o')?.valueChanges.subscribe(estadoId => {
      if (estadoId) {
        this.lisService.obtenerMunicipios(estadoId).subscribe({
          next: (municipios) => {
          this.municipios = municipios;
          this.formulario.get('origen.MunicipioID_o')?.reset();
          }
        });
      }
    });
    this.formulario.get('destino.PaisID_d')?.valueChanges.subscribe(paisId => {
    if (paisId) {
      this.lisService.obtenerEstados(paisId).subscribe({
        next: (estados) => {
          this.estadosDestino = estados;
          this.formulario.get('destino.EstadoID_d')?.reset();
          this.municipiosDestino = [];
        }
      });
    }
  });

  this.formulario.get('destino.EstadoID_d')?.valueChanges.subscribe(estadoId => {
    if (estadoId) {
      this.lisService.obtenerMunicipios(estadoId).subscribe({
        next: (municipios) => {
          this.municipiosDestino = municipios;
          this.formulario.get('destino.MunicipioID_d')?.reset();
        }
      });
    }
  });
}
  private formatearFecha(fecha: string): string {
  // Recortamos a los primeros 16 caracteres (YYYY-MM-DDTHH:mm)
  return fecha ? fecha.substring(0, 16) : '';
}
  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const formularioValor = this.formulario.value;

const viaje: any = {
  // Origen
  Calle_o: formularioValor.origen.Calle_o,
  Colonia_o: formularioValor.origen.Colonia_o,
  Numero_exterior_o: formularioValor.origen.Numero_exterior_o,
  Numero_interior_o: formularioValor.origen.Numero_interior_o,
  PaisID_o: formularioValor.origen.PaisID_o,
  EstadoID_o: formularioValor.origen.EstadoID_o,
  MunicipioID_o: formularioValor.origen.MunicipioID_o,

  // Destino
  Calle_d: formularioValor.destino.Calle_d,
  Colonia_d: formularioValor.destino.Colonia_d,
  Numero_exterior_d: formularioValor.destino.Numero_exterior_d,
  Numero_interior_d: formularioValor.destino.Numero_interior_d,
  PaisID_d: formularioValor.destino.PaisID_d,
  EstadoID_d: formularioValor.destino.EstadoID_d,
  MunicipioID_d: formularioValor.destino.MunicipioID_d,

  // Operador y fechas
  OperadorID: formularioValor.operadorYFechas.OperadorID,
  Fecha_inicio: formularioValor.operadorYFechas.Fecha_inicio,
  Fecha_fin: formularioValor.operadorYFechas.Fecha_fin
};    
    if(this.viajeId != null)
    {
      viaje.ViajeID = this.viajeId;
      this.lisService.modificarViaje(viaje).subscribe({
      next: (response) => {
      
      if (response.error === true) {
        Swal.fire({
          title: "Ocurrió un error",
          text: response.errorDesc,
          icon: response.icon as any,
          showConfirmButton:true
          }).then(() => {
            //Se manda a llamar el metodo onViajeAgregado
          this.viajeAgregado.emit();
        });        
      } else {
        Swal.fire({
          title: "Registro actualizado",          
          icon: response.icon as any,
          showConfirmButton:true
        }).then(() => {
          //Limpia el formulario
          this.limpiarFormulario();
          //Se manda a llamar el metodo onViajeAgregado
          this.viajeAgregado.emit();
        });
      }
    },
      error: (err) => {
      Swal.fire({
        title: "Error en la conexión",
        text: "Sucedió un error al intentar la conexión",
        icon: "error",
        showConfirmButton:true
      });
    }
    });
    }else{
      this.lisService.insertarViaje(viaje).subscribe({
      next: (response) => {      
      if (response.error === true) {
        Swal.fire({
          title: "Ocurrió un error",
          text: response.errorDesc,
          icon: response.icon as any,
          showConfirmButton:true
          }).then(() => {
            //Limpia el formulario
          this.limpiarFormulario();
            //Se manda a llamar el metodo onViajeAgregado
          this.viajeAgregado.emit();
        });        
      } else {
        Swal.fire({
          title: "Registro guardado",          
          icon: response.icon as any,
          showConfirmButton:true
        }).then(() => {
          //Limpia el formulario
          this.limpiarFormulario();
          //Se manda a llamar el metodo onViajeAgregado
          this.viajeAgregado.emit();
        });
      }
    },
      error: (err) => {
      Swal.fire({
        title: "Error en la conexión",
        text: "Sucedió un error al intentar la conexión",
        icon: "error",
        showConfirmButton:true
      });
    }
    });
  }
}
}
    

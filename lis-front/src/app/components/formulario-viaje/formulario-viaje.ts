import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LisApi } from '../../services/lis-api'
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulario-viaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-viaje.html',
  styleUrls: ['./formulario-viaje.css'],
  providers: [DatePipe]
})
export class FormularioViajeComponent implements OnInit {

   @Output() viajeAgregado = new EventEmitter<void>();

  formulario!: FormGroup;
  operadores: any[] = [];
  paises : any[] = [];
  estados: any[] = [];
  municipios: any[] = [];
  paisesDestino : any[] = [];
  estadosDestino: any[] = [];
  municipiosDestino: any[] = [];  

  constructor(private fb: FormBuilder, private lisService: LisApi) { }


  cargarCatalogos(): void {
    this.lisService.obtenerPaises().subscribe({
      next: (data) => { 
        this.paises = data; 
        this.paisesDestino = data;
        console.log('Paises cargados', data);
      }
    });
    this.lisService.obtenerOperadores().subscribe({
      next: (data) => { 
        this.operadores = data; 
        console.log('Operadores cargados', data);
      }
    });
  }
  limpiarFormulario() {
  this.formulario.reset();
  this.operadores = [];
  this.paises = [];
  this.estados = [];
  this.municipios = [];
  this.paisesDestino = [];
  this.estadosDestino = [];
  this.municipiosDestino = [];
}
cancelar() {
  this.formulario.reset();  
  this.viajeAgregado.emit();
}
  ngOnInit(): void {
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
    this.cargarCatalogos();
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

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const formularioValor = this.formulario.value;

const viaje: any = {
  // Campos de origen
  Calle_o: formularioValor.origen.Calle_o,
  Colonia_o: formularioValor.origen.Colonia_o,
  Numero_exterior_o: formularioValor.origen.Numero_exterior_o,
  Numero_interior_o: formularioValor.origen.Numero_interior_o,
  PaisID_o: formularioValor.origen.PaisID_o,
  EstadoID_o: formularioValor.origen.EstadoID_o,
  MunicipioID_o: formularioValor.origen.MunicipioID_o,

  // Campos de destino
  Calle_d: formularioValor.destino.Calle_d,
  Colonia_d: formularioValor.destino.Colonia_d,
  Numero_exterior_d: formularioValor.destino.Numero_exterior_d,
  Numero_interior_d: formularioValor.destino.Numero_interior_d,
  PaisID_d: formularioValor.destino.PaisID_d,
  EstadoID_d: formularioValor.destino.EstadoID_d,
  MunicipioID_d: formularioValor.destino.MunicipioID_d,

  // Campos de operador y fechas
  OperadorID: formularioValor.operadorYFechas.OperadorID,
  Fecha_inicio: formularioValor.operadorYFechas.Fecha_inicio,
  Fecha_fin: formularioValor.operadorYFechas.Fecha_fin
};
    console.log("viaje",viaje);
    this.lisService.insertarViaje(viaje).subscribe({
      next: (response) => {

      // Verificamos la propiedad Error del backend:
      if (response.error === true) {
        Swal.fire({
          title: "Ocurrió un error",
          text: response.errorDesc,
          icon: response.icon as any,
          showConfirmButton:true
          }).then(() => {
          this.viajeAgregado.emit();
        });        
      } else {
        Swal.fire({
          title: "Registro guardado",          
          icon: response.icon as any,
          showConfirmButton:true
        }).then(() => {
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

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LisApi } from '../../services/lis-api'
import { DatePipe } from '@angular/common';

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

  ngOnInit(): void {
    this.formulario = this.fb.group({

      origen: this.fb.group({
        calle: ['', Validators.required],
        colonia: ['', Validators.required],
        numeroExterior: ['', Validators.required],
        numeroInterior: [''],
        pais: ['', Validators.required],
        estado: ['', Validators.required],
        municipio: ['', Validators.required],
      }),

      destino: this.fb.group({
        calle_destino: ['', Validators.required],
        colonia_destino: ['', Validators.required],
        numeroExterior_destino: ['', Validators.required],
        numeroInterior_destino: [''],
        pais_destino: ['', Validators.required],
        estado_destino: ['', Validators.required],
        municipio_destino: ['', Validators.required],
      }),

      operadorYFechas: this.fb.group({
        operador: ['', Validators.required],
        fechaInicio: ['', Validators.required],
        fechaFin: ['', Validators.required],
      })

    });
    this.cargarCatalogos();
    // Suscribirse al cambio de país (origen)
  this.formulario.get('origen.pais')?.valueChanges.subscribe(paisId => {
    if (paisId) {
      this.lisService.obtenerEstados(paisId).subscribe({
        next: (estados) => {
          this.estados = estados;
          this.formulario.get('origen.estado')?.reset();  // reseteamos el estado al cambiar el país
          this.municipios = []; // limpiamos los municipios
        }
      });
    }
    });
    // Suscribirse al cambio de estado (origen)
    this.formulario.get('origen.estado')?.valueChanges.subscribe(estadoId => {
      if (estadoId) {
        this.lisService.obtenerMunicipios(estadoId).subscribe({
          next: (municipios) => {
          this.municipios = municipios;
          this.formulario.get('origen.municipio')?.reset();
          }
        });
      }
    });
    this.formulario.get('destino.pais_destino')?.valueChanges.subscribe(paisId => {
    if (paisId) {
      this.lisService.obtenerEstados(paisId).subscribe({
        next: (estados) => {
          this.estadosDestino = estados;
          this.formulario.get('destino.estado_destino')?.reset();
          this.municipiosDestino = [];
        }
      });
    }
  });

  this.formulario.get('destino.estado_destino')?.valueChanges.subscribe(estadoId => {
    if (estadoId) {
      this.lisService.obtenerMunicipios(estadoId).subscribe({
        next: (municipios) => {
          this.municipiosDestino = municipios;
          this.formulario.get('destino.municipio_destino')?.reset();
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

    const viaje = this.formulario.value;
    this.lisService.insertarViaje(viaje).subscribe({
      next: () => {
        this.viajeAgregado.emit();
      },
      error: (err) => console.error(err)
    });
  }
}

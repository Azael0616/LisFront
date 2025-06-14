import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LisApi } from '../../services/lis-api'
import { ReactiveFormsModule } from '@angular/forms';
import {FormularioViajeComponent} from '../formulario-viaje/formulario-viaje'

@Component({
  selector: 'app-tabla-viajes',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormularioViajeComponent],
  templateUrl: './tabla-viajes.html',
  styleUrl: './tabla-viajes.css'
})
export class TablaViajes {
  datos: any[] = [];
  formularioVisible = false;
  constructor(private lisService: LisApi) { }
  obtenerDatos(): void {
    this.lisService.obtenerViajes().subscribe({
      next: (response) => {
        this.datos = response;
        console.log("datos: ",this.datos);
      },
      error: (err) => {
        console.error('Error al obtener los datos', err);
      }
    });
  }
   ngOnInit(): void {
    this.obtenerDatos();
  }
  mostrarFormulario(): void {
    this.formularioVisible = true;
  }

  onViajeAgregado(): void {
    this.formularioVisible = false;
    this.obtenerDatos();
  }
}

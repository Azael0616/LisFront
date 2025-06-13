import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LisApi } from '../../services/lis-api'

@Component({
  selector: 'app-tabla-viajes',
  imports: [CommonModule],
  templateUrl: './tabla-viajes.html',
  styleUrl: './tabla-viajes.css'
})
export class TablaViajes {
  datos: any[] = [];
  constructor(private lisService: LisApi) { }
   ngOnInit(): void {
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
}

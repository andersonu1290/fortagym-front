//tranformarlo para nutricionista:

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-nutricionista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nutricionista.html',
  styleUrl: './nutricionista.scss'
})
export class Nutricionista implements OnInit {
  nombreUsuario: string = 'Cargando...';
  menuAbierto: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getPerfil().subscribe({
      next: (perfil) => {
        this.nombreUsuario = perfil.nombre;
      },
      error: () => this.nombreUsuario = 'Nutricionista'
    });
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

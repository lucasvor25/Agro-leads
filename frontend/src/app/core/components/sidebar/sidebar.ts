import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- Importante para navegar

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule], // <--- Adicione o RouterModule aqui
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  @Output() toggle = new EventEmitter<boolean>(); // Avisa o pai que mudou
  collapsed = false;

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    this.toggle.emit(this.collapsed);
  }
}
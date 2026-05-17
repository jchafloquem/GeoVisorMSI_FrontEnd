import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag } from '@angular/cdk/drag-drop';

import { CapasComponent } from './components/capas/capas';
import { Buscar } from './components/buscar/buscar';
import { Leyenda } from './components/leyenda/leyenda';
import { MapService } from '../../../../../../services/map.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CapasComponent,
    Buscar,
    Leyenda,
    CdkDrag
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  public mapService = inject(MapService);

  /** Exponemos el signal para que el template sepa cuál está activo visualmente */
  activeTools = this.mapService.activeSidebarTools;

  isExpanded = true;

  // Mock de ítems de navegación
  menuItems = [
    { id: 'search', icon: 'bi bi-search', label: 'Buscar', active: false },
    { id: 'searchint', icon: 'bi bi-funnel-fill', label: 'Busqueda Avanzada', active: false },
    { id: 'layers', icon: 'bi bi-layers', label: 'Capas', active: false },
    { id: 'legend', icon: 'bi bi-map', label: 'Leyenda', active: false },
    { id: 'print', icon: 'bi bi-printer', label: 'Imprimir', active: false },
    { id: 'accessibility', icon: 'bi bi-universal-access', label: 'Accesibilidad', active: false },
    { id: 'settings', icon: 'bi bi-gear', label: 'Configuración', active: false },
    { id: 'info', icon: 'bi bi-info-circle', label: 'Acerca', active: false }
  ];

  // Mock de capas estáticas para la réplica visual
  mockLayers = [
    { name: 'Lotes Urbanos', visible: true, opacity: 100 },
    { name: 'Manzanas Catastrales', visible: true, opacity: 80 },
    { name: 'Vías y Accesos', visible: false, opacity: 100 },
    { name: 'Límites Distritales', visible: true, opacity: 50 }
  ];

  ngOnInit() {
    // Sincronizamos el ítem activo por defecto con el estado global del mapa
    this.menuItems.forEach(item => {
      if (item.active) {
        this.mapService.toggleSidebarTool(item.id);
      }
    });
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  toggleTool(toolId: string) {
    console.log('Sidebar: Recibida orden de toggle para', toolId);
    const item = this.menuItems.find(i => i.id === toolId);
    if (item) {
      this.setActive(item);
    }
  }

  setActive(item: { id: string; icon: string; label: string; active: boolean }) {
    item.active = !item.active;

    // Centralizamos el estado en el servicio para que el MapComponent reaccione
    this.mapService.toggleSidebarTool(item.id);
    this.isExpanded = true;
  }
}

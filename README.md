## Visor Atención al Ciudadano

Este proyecto es un visor cartográfico avanzado desarrollado para **COFOPRI**, diseñado para la atención al ciudadano. Permite la visualización de predios y herramientas de búsqueda geoespacial.

Desarrollado con **Angular 20** y **OpenLayers**.

## 🚀 Características Principales

- **Arquitectura Standalone:** Uso de componentes independientes para mayor modularidad.
- **Gestión de Estado con Signals:** Reactividad eficiente para coordenadas y estados del mapa.
- **Mapa Interactivo:** 
  - Soporte para mapas base (Google Satellite y OpenStreetMap).
  - Integración de capas WMS (IDEP - Límites Departamentales).
  - Control de vista general (Overview Map).
  - Geolocalización en tiempo real.
- **Búsqueda Avanzada:** Búsqueda de predios por dirección, código catastral y datos del ciudadano (DNI/Nombre).

## 🛠️ Tecnologías y Dependencias

- **Angular:** Framework principal.
- **OpenLayers (ol):** Motor de renderizado de mapas.
- **IDEP WMS:** Servicios de mapas de la Infraestructura de Datos Espaciales del Perú.
- **Google Maps API:** Capas satelitales.

## 📁 Estructura del proyecto

```
src/
 ├── app/
 │   ├── animation/       # Componentes, pipes y utilidades reutilizables
 │   ├── components/      # 
 │   ├── core/            # Servicios globales, interceptores, guards
 │   ├── css/             #
 │   ├── interfaces/      #
 │   ├── models/          #
 │   ├── services/        #
 │   ├── util/            #
 │   ├── features/        # Módulos por dominio/funcionalidad
 │   └── app.module.ts
 ├── assets/
 ├── environments/
 │   ├── environment.ts
 │   └── environment.prod.ts
 ├── typings/
 └── main.ts
```

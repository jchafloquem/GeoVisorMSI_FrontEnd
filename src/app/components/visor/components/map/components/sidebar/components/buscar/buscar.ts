import { Component, Input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** Interfaz para los resultados de búsqueda de predios */
export interface SearchResult {
  codigoCatastral: string;
  direccion: string;
  propietario?: string;
  area?: string;
  zonificacion?: string;
  fotoFrontis: string;
  numeroPisos?: number;
  materialPredominante?: string;
  estadoConservacion?: string;
}

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar.html',
  styleUrl: './buscar.css',
})
export class Buscar {
  @Input() isGuest: boolean = false;  
  onClose = output<void>();
  onSearchResult = output<SearchResult>();
  /** Control de minimizado */
  isMinimized = signal(false);
  /** Control de pestañas */
  activeTab: 'direccion' | 'catastral' | 'ciudadano' = 'direccion';
  /** Campos para búsqueda por Dirección */
  tiposVia = ["Avenida", "Calle", "Jirón", "Pasaje", "Alameda", "Malecón", "Prolongación", "Plaza", "Parque"];
  tipoVia = '';
  nombreVia = '';
  numeroMunicipal = '';
  block = '';
  departamento = '';
  /** Campos para búsqueda Catastral */
  codigoCatastral = '';
  /** Campos para búsqueda por Ciudadano */
  searchType: 'dni' | 'nombre' = 'dni';
  dni = '';
  nombreCiudadano = '';
  showCitizenResults = false;
  selectedCitizen = '';
  citizenProperties: SearchResult[] = [];
  /** Datos simulados para la demostración */
  private mockCitizenProperties: SearchResult[] = [
    {
      codigoCatastral: "05-012-003",
      direccion: "Av. La Marina 2450, San Miguel",
      propietario: "Carlos Alberto Fernández Silva",
      area: "120.50 m²",
      zonificacion: "RDM",
      fotoFrontis: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80",
      numeroPisos: 3,
      materialPredominante: "Ladrillo",
      estadoConservacion: "Bueno",
    },
    {
      codigoCatastral: "05-018-007",
      direccion: "Jr. Federico Gallese 890, San Miguel",
      propietario: "Carlos Alberto Fernández Silva",
      area: "95.00 m²",
      zonificacion: "RDA",
      fotoFrontis: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80",
      numeroPisos: 5,
      materialPredominante: "Ladrillo",
      estadoConservacion: "Muy Bueno",
    }
  ];

  /** Alterna el estado de minimizado del panel */
  toggleMinimize() {
    this.isMinimized.update(v => !v);
  }

  /** Formatea el código catastral mientras el usuario escribe (XX-XXX-XXX) */
  handleCodigoCatastralChange(value: string) {
    const numbers = value.replace(/\D/g, "");
    let formatted = "";
    if (numbers.length > 0) formatted = numbers.slice(0, 2);
    if (numbers.length > 2) formatted += "-" + numbers.slice(2, 5);
    if (numbers.length > 5) formatted += "-" + numbers.slice(5, 8);
    this.codigoCatastral = formatted;
  }

  /** Asegura que el DNI sea solo numérico y de 8 dígitos */
  handleDniChange(value: string) {
    this.dni = value.replace(/\D/g, "").slice(0, 8);
  }

  /** Limpia los campos de la pestaña activa */
  handleClear() {
    if (this.activeTab === 'direccion') {
      this.tipoVia = '';
      this.nombreVia = '';
      this.numeroMunicipal = '';
      this.block = '';
      this.departamento = '';
    } else if (this.activeTab === 'catastral') {
      this.codigoCatastral = '';
    } else {
      this.dni = '';
      this.nombreCiudadano = '';
    }
  }

  /** Valida si el botón de búsqueda debe estar deshabilitado */
  isSearchDisabled(): boolean {
    switch (this.activeTab) {
      case 'direccion':
        return !this.nombreVia || !this.tipoVia;
      case 'catastral':
        return this.codigoCatastral.length < 10;
      case 'ciudadano':
        return this.searchType === 'dni'
          ? this.dni.length < 8
          : this.nombreCiudadano.trim().length < 3;
      default:
        return true;
    }
  }

  /** Ejecuta la búsqueda según la pestaña activa */
  handleSearch() {
    if (this.activeTab === 'direccion') {
      const result: SearchResult = {
        codigoCatastral: "05-012-003",
        direccion: `${this.tipoVia} ${this.nombreVia} ${this.numeroMunicipal}${this.block ? `, Block ${this.block}` : ""}${this.departamento ? `, Dpto. ${this.departamento}` : ""}, Miraflores`,
        propietario: "Juan Carlos Mendoza López",
        area: "120.50 m²",
        zonificacion: "RDM (Residencial)",
        fotoFrontis: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80",
        numeroPisos: 5,
        materialPredominante: "Ladrillo",
        estadoConservacion: "Muy Bueno",
      };
      this.emitResult(result);
    } else if (this.activeTab === 'catastral') {
      const result: SearchResult = {
        codigoCatastral: this.codigoCatastral,
        direccion: "Av. José Pardo 456, Miraflores",
        propietario: "María Elena Vargas Rodríguez",
        area: "250.00 m²",
        zonificacion: "CZ (Comercio Zonal)",
        fotoFrontis: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80",
        numeroPisos: 5,
        materialPredominante: "Ladrillo",
        estadoConservacion: "Muy Bueno",
      };
      this.emitResult(result);
    } else if (this.activeTab === 'ciudadano') {
      this.selectedCitizen = this.searchType === 'dni'
        ? "Carlos Alberto Fernández Silva"
        : this.nombreCiudadano;

      // Simulamos una carga de datos
      this.citizenProperties = this.mockCitizenProperties;
      this.showCitizenResults = true;
    }
  }

  /** Selecciona un predio de la lista del ciudadano */
  handleSelectProperty(property: SearchResult) {
    this.emitResult(property);
    this.showCitizenResults = false;
  }

  /** Método privado para emitir el resultado y opcionalmente cerrar el panel */
  private emitResult(result: SearchResult) {
    console.log('Resultado encontrado:', result);
    this.onSearchResult.emit(result);
    // Si deseas que el panel de búsqueda se cierre automáticamente al encontrar algo:
    // this.onClose.emit();
  }
}

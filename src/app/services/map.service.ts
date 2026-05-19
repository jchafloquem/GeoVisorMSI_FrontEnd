import { Injectable, signal, inject, NgZone, effect } from '@angular/core';
import { OtrosService } from './otros.service';
import {
  fromLonLat,
  OlMap,
  TileLayer,
  TileWMS,
  View,
  XYZ
} from '../modules/openlayers.module';

/** Coordenadas iniciales del centro del mapa (longitud, latitud) */
export const INITIAL_CENTER = [-77.0341, -12.0975];
/** Nivel de zoom inicial del mapa */
export const INITIAL_ZOOM = 15.5;
/** URL del servicio de mapas satelitales de Google */
const GOOGLE_SATELLITE_URL = 'https://mt1.google.com/vt/lyrs=s&hl=es&x={x}&y={y}&z={z}';
/** URL del servicio de mapas de calles (OpenStreetMap) */
export const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
/** Duración de las animaciones del mapa en milisegundos */
export const ANIMATION_DURATION = 1000;
/** Nivel de zoom al que se acerca el mapa al obtener la ubicación del usuario */
export const ZOOM_LEVEL_LOCATION = 20;

export interface LayerItem {
  id: string;
  label: string;
  visible: boolean;
  opacity: number;
  olLayer?: TileLayer;
  legendUrl?: string; // Añadimos la propiedad legendUrl
}

export interface Section {
  id: string;
  title: string;
  expanded: boolean;
  layers: LayerItem[];
}

/**
 * Servicio de Angular para la gestión del mapa OpenLayers.
 * Encapsula toda la lógica relacionada con la inicialización, manipulación
 * y gestión de elementos del mapa, como capas, controles y overlays.
 */
@Injectable({
  providedIn: 'root'
})
export class MapService {
  /** Instancia del mapa OpenLayers */
  private _map = signal<OlMap | undefined>(undefined);
  /** Exposición del mapa como Signal de solo lectura */
  private zone = inject(NgZone);
  public readonly map = this._map.asReadonly();

  /** Servicio para fuentes de datos externas */
  private otrosService = inject(OtrosService);
  /** Capa de imágenes satelitales (Google) */
  public satelliteLayer?: TileLayer;
  /** Capa de calles (OSM) */
  public streetsLayer?: TileLayer;

  /**
   * Signal que gestiona las secciones y capas del visor.
   */
  sections = signal<Section[]>([
    {
      id: "tematica",
      title: "Información Temática",
      expanded: false,
      layers: [
        { id: "zonificacion", label: "ZONIFICACIÓN", visible: true, opacity: 1 },
        { id: "equipamiento", label: "EQUIPAMIENTO URBANO", visible: true, opacity: 1 },
        { id: "clasificacion", label: "CLASIFICACIÓN DEL PREDIO (TEMÁTICO)", visible: true, opacity: 1 },
      ],
    },
    {
      id: "catastral",
      title: "Información Catastral",
      expanded: true,
      layers: [
        { id: "sector", label: "SECTOR CATASTRAL", visible: true, opacity: 1 },
        { id: "manzana", label: "MANZANA CATASTRAL", visible: true, opacity: 1 },
        { id: "lote", label: "LOTE CATASTRAL", visible: true, opacity: 1 },
        { id: "parques", label: "PARQUES", visible: true, opacity: 1 },
        { id: "vias", label: "VIAS", visible: true, opacity: 1 },
        { id: "edificaciones", label: "EDIFICACIONES", visible: true, opacity: 1 },
        { id: "construcciones", label: "CONSTRUCCIONES", visible: true, opacity: 1 },
        { id: "puerta", label: "PUERTA (NUMERO MUNICIPAL / TIPO)", visible: true, opacity: 1 },
      ],
    },
    {
      id: "habilitacion",
      title: "Habilitación Urbana",
      expanded: false,
      layers: [
        { id: "limite", label: "LIMITE DE HABILITACION URBANA (NUCLEO)", visible: true, opacity: 1 },
        { id: "manzana-urbana", label: "MANZANA URBANA", visible: true, opacity: 1 },
        { id: "lote-urbano", label: "LOTE URBANO", visible: true, opacity: 1 },
      ],
    },
    {
      id: "politicos",
      title: "Límites Políticos",
      expanded: false,
      layers: [
        { id: "departamento", label: "DEPARTAMENTO", visible: true, opacity: 1 },
        { id: "provincia", label: "PROVINCIA", visible: true, opacity: 1 },
        { id: "distrito", label: "DISTRITO", visible: true, opacity: 1 },
        { id: "centropoblado", label: "CENTROS POBLADOS", visible: true, opacity: 1 },
      ],
    },
  ]);

  constructor() {
    // Efecto para sincronizar la visibilidad del mapa cuando cambia el signal de secciones
    effect(() => {
      // Iteramos sobre las secciones y capas
      this.sections().forEach((section: Section) => {
        section.layers.forEach((layerData: LayerItem) => {
          // Si la capa de OpenLayers ya está instanciada, sincronizamos su estado
          if (layerData.olLayer) {
            layerData.olLayer.setVisible(layerData.visible);
            layerData.olLayer.setOpacity(layerData.opacity);
          }
        });
      });
    });
  }

  /**
   * Signal que indica si el mapa ha sido inicializado y está listo para su uso.
   * @type {Signal<boolean>}
   */
  isReady = signal(false);

  /**
   * Signal que almacena las coordenadas actuales del usuario (longitud, latitud).
   * Es `null` si la ubicación no ha sido obtenida o ha sido limpiada.
   * @type {Signal<{ lon: number, lat: number } | null>}
   */
  userCoords = signal<{ lon: number, lat: number } | null>(null);

  /**
   * Signal que almacena el tipo de mapa base actual.
   * @type {WritableSignal<'satellite' | 'streets'>}
   */
  baseLayerType = signal<'satellite' | 'streets'>('satellite');

  /**
   * Signal que rastrea qué herramientas del sidebar están activas.
   * @type {WritableSignal<Set<string>>}
   */
  activeSidebarTools = signal<Set<string>>(new Set());

  /**
   * Inicializa el mapa OpenLayers en el elemento HTML proporcionado.
   * Configura las capas base, controles y vista inicial.
   */
  initMap(target: HTMLElement): OlMap {
    if (this._map()) {
      this._map()!.setTarget(target);
      return this._map()!;
    }

    // Inicialización de fuentes
    const satelliteSource = new XYZ({
      url: GOOGLE_SATELLITE_URL,
      crossOrigin: 'anonymous',
      transition: 1000, // 1 segundo de fade-in para una aparición muy elegante
      interpolate: true // Evita que se vean cuadrados pixelados al hacer zoom
    });
    const streetsSource = new XYZ({
      url: OSM_URL,
      crossOrigin: 'anonymous',
      transition: 1000,
      interpolate: true
    });

    // Creación de capas base usando método auxiliar
    this.satelliteLayer = this.createBaseLayer(satelliteSource, 'Satélite', 'satellite');
    this.streetsLayer = this.createBaseLayer(streetsSource, 'Calles', 'streets');

    const olMap = new OlMap({
      target,
      layers: [this.satelliteLayer, this.streetsLayer],
      view: new View({
        center: fromLonLat(INITIAL_CENTER),
        zoom: INITIAL_ZOOM,
      })
    });
    this._map.set(olMap);

    // Ejecutamos fuera de la zona de Angular para no bloquear la UI ni disparar CD
    // Usamos requestAnimationFrame para sincronizar con el refresco de pantalla
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        olMap.updateSize();
      });
    });

    this.loadPeruBorder();
    this.loadPeruProvinces();
    this.loadPeruDistricts();
    this.loadPeruPopulationCenters();

    return olMap;
  }

  /**
   * Método auxiliar para estandarizar la creación de capas base.
   * @private
   */
  private createBaseLayer(source: XYZ, title: string, type: 'satellite' | 'streets'): TileLayer {
    return new TileLayer({
      source,
      properties: { title },
      preload: 0, // 0 es el valor por defecto y el más eficiente para el arranque
      visible: this.baseLayerType() === type
    });
  }

  /**
   * Carga la capa de límites departamentales del INEI.
   * @private
   */
  private loadPeruBorder(): void {
    this.addWmsLayer('departamento', this.otrosService.INEI_WMS_URL, this.otrosService.INEI_WMS_VERSION, 'Interoperabilidad:ig_departamento', 1000, undefined, 0, 17);
  }

  /**
   * Carga la capa de límites provinciales del INEI.
   * @private
   */
  private loadPeruProvinces(): void {
    // Se oculta a partir de nivel de zoom 16 (escala aprox. 1:10000)
    this.addWmsLayer('provincia', this.otrosService.INEI_WMS_URL, this.otrosService.INEI_WMS_VERSION, 'Interoperabilidad:ig_provincia', 1100, undefined, 8, 17);
  }

  /**
   * Carga la capa de límites distritales del INEI.
   * @private
   */
  private loadPeruDistricts(): void {
    // Se oculta a partir de nivel de zoom 17 (escala aprox. 1:5000)
    // Agregamos 'white-layer-filter' para poder cambiar el color vía CSS
    this.addWmsLayer('distrito', this.otrosService.INEI_WMS_URL, this.otrosService.INEI_WMS_VERSION, 'Interoperabilidad:ig_distrito', 1200, 'Distritos', 11, 17, 'white-layer-filter');
  }

  /**
   * Carga la capa de centros poblados del INEI.
   * @private
   */
  private loadPeruPopulationCenters(): void {
    this.addWmsLayer('centropoblado', this.otrosService.INEI_WMS_URL, this.otrosService.INEI_WMS_VERSION, 'Interoperabilidad:ig_centropoblado', 1300, 'Centros Poblados', 12);
  }

  /**
   * Método genérico para agregar capas WMS al mapa.
   * @private
   */
  private addWmsLayer(id: string, url: string, version: string, layerName: string, zIndex: number, title?: string, minZoom?: number, maxZoom?: number, className?: string): void {
    const map = this._map();
    if (!map) return;

    const layer = new TileLayer({
      source: new TileWMS({
        url,
        params: {
          'LAYERS': layerName,
          'TILED': true,
          'VERSION': version,
          'FORMAT': 'image/png',
          'TRANSPARENT': true
        },
        crossOrigin: 'anonymous',
        serverType: 'geoserver'
      }),
      className: className, // Aplicamos la clase CSS a la capa
      zIndex: zIndex,
      minZoom: minZoom, // Añadimos la propiedad minZoom aquí
      maxZoom: maxZoom, // La capa se ocultará si el zoom es igual o mayor a este valor
      properties: { id, title }
    });

    map.addLayer(layer);

    // IMPORTANTE: Guardamos la instancia de la capa en el Signal para poder manipularla después
    // Generamos la URL de la leyenda para servicios WMS (estándar GetLegendGraphic)
    const legendUrl = `${url}${url.includes('?') ? '' : '?'}` + 
      `SERVICE=WMS&VERSION=${version}&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=${layerName}&TRANSPARENT=true`;

    this.sections.update(sections => sections.map(section => ({
      ...section,
      layers: section.layers.map(l => l.id === id ? { ...l, olLayer: layer, legendUrl } : l)
    })));
  }

  /**
   * Agrega una capa WMS desde el servicio IDEP (Límites).
   * @param layerName Nombre técnico de la capa (ej: '0' para Departamentos, '1' para Provincias)
   * @param title Título amigable para la capa
   */
  addIdepWmsLayer(layerName: string, title: string): void {
    this.addWmsLayer(layerName, this.otrosService.WMS_URL, this.otrosService.WMS_VERSION, layerName, 100, title, 0); // Usamos layerName como ID por defecto
  }

  /**
   * Métodos para actualizar el estado de las secciones desde la UI
   */
  toggleSectionExpanded(sectionId: string) {
    this.sections.update(s => s.map(sec =>
      sec.id === sectionId ? { ...sec, expanded: !sec.expanded } : sec
    ));
  }

  toggleLayerVisibility(sectionId: string, layerId: string) {
    this.sections.update(s => s.map(sec =>
      sec.id === sectionId ? {
        ...sec,
        layers: sec.layers.map((l: LayerItem) => l.id === layerId ? { ...l, visible: !l.visible } : l)
      } : sec
    ));
  }

  toggleAllLayersInSection(sectionId: string, visible: boolean) {
    this.sections.update(s => s.map(sec =>
      sec.id === sectionId ? {
        ...sec,
        layers: sec.layers.map((l: LayerItem) => ({ ...l, visible }))
      } : sec
    ));
  }

  /**
   * Alterna la herramienta activa del sidebar. Si se hace clic en la misma, se cierra.
   * @param toolId Identificador de la herramienta (ej: 'layers')
   */
  toggleSidebarTool(toolId: string): void {
    this.activeSidebarTools.update(tools => {
      const newTools = new Set(tools);
      if (newTools.has(toolId)) {
        newTools.delete(toolId);
      } else {
        newTools.add(toolId);
      }
      return newTools;
    });
  }
}

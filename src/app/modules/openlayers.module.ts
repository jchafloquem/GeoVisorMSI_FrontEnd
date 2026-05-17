import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importaciones de OpenLayers
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Overlay, { Positioning as OverlayPositioning } from 'ol/Overlay';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import { defaults as defaultControls, OverviewMap, ScaleLine, FullScreen, ZoomSlider } from 'ol/control';
import { fromLonLat, transform } from 'ol/proj';
import { Style, Fill, Stroke, Circle, Icon, Text } from 'ol/style';
import Feature from 'ol/Feature';
import { Point, LineString, Polygon } from 'ol/geom';
import TileWMS from 'ol/source/TileWMS';
/**
 * Este módulo centraliza las herramientas de OpenLayers.
 * Puedes usarlo como un punto central de exportación para simplificar tus componentes.
 */
@NgModule({
  imports: [CommonModule],
  exports: []
})
export class OpenLayersModule { }
// Re-exportamos las clases y funciones para usarlas en toda la aplicación
export {
  OlMap,
  View,
  TileLayer,
  Overlay,
  type OverlayPositioning,
  VectorLayer,
  XYZ,
  VectorSource,
  defaultControls,
  OverviewMap,
  ScaleLine,
  FullScreen,
  ZoomSlider,
  fromLonLat,
  transform,
  Style,
  Fill,
  Stroke,
  Circle,
  Icon,
  Text,
  Feature,
  Point,
  LineString,
  Polygon,
  TileWMS
};

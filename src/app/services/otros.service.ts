import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OtrosService {
  private http = inject(HttpClient);

  /** URL base del servidor WMS de Límites del IDEP */
  // Usamos una ruta relativa para que sea interceptada por el proxy de desarrollo y evitar errores de CORS
  public readonly WMS_URL = '/geoserver/CTS_sismohistorico/wms?'

  /** Versión estándar de WMS a utilizar en la aplicación */
  public readonly WMS_VERSION = '1.3.0';

  /** URL del servidor WMS del INEI para límites administrativos */
  public readonly INEI_WMS_URL = 'https://geoespacial.inei.gob.pe/geoserver/Interoperabilidad/wms';

  /** Versión del servicio WMS del INEI */
  public readonly INEI_WMS_VERSION = '1.1.0';

  /**
   * Obtiene el documento de capacidades (GetCapabilities) del servidor.
   * Este XML contiene la lista de capas disponibles como Límites Departamentales, Provinciales y Distritales.
   */
  getCapabilities(): Observable<string> {
    return this.http.get(this.WMS_URL, {
      params: {
        SERVICE: 'WMS',
        REQUEST: 'GetCapabilities',
        VERSION: this.WMS_VERSION
      },
      responseType: 'text'
    });
  }
}

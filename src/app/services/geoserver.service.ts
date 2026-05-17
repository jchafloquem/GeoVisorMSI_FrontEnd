import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Servicio encargado de interactuar con la API REST de GeoServer.
 * Permite gestionar workspaces, obtener metadatos de capas y detalles de publicación.
 */
@Injectable({
  providedIn: 'root'
})
export class GeoserverService {
  private http = inject(HttpClient);

  // Rutas base del GeoServer (basadas en tu información)
  private readonly BASE_URL = 'https://geoserver.ue003cofopri.gob.pe/geoserver/rest';

  /** URL base para las peticiones WMS (Web Map Service) */
  public readonly WMS_URL = 'https://geoserver.ue003cofopri.gob.pe/geoserver/wms';

  // Credenciales proporcionadas
  private readonly USER = 'admin';
  private readonly PASS = 'Cofopri$Ue003-+-';

  /**
   * Crea los headers necesarios para la autenticación básica y solicita JSON
   * @private
   * @returns {HttpHeaders} Encabezados con Authorization y Accept application/json.
   */
  private getHeaders(): HttpHeaders {
    // Codificamos las credenciales en Base64 para Basic Auth
    const auth = btoa(`${this.USER}:${this.PASS}`);
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    });
  }

  /**
   * Obtiene la lista de todos los workspaces
   * Nota: Usamos .json en la URL para obtener un objeto manipulable directamente
   * @returns {Observable<any>} Observable con el listado de espacios de trabajo.
   */
  getWorkspaces(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/workspaces.json`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene la lista de todas las capas (layers)
   * @returns {Observable<any>} Observable con el listado global de capas.
   */
  getLayers(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/layers.json`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene la lista de capas filtradas por un workspace específico
   * @param {string} workspace Nombre del espacio de trabajo.
   * @returns {Observable<any>} Observable con las capas de ese workspace.
   */
  getLayersByWorkspace(workspace: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/workspaces/${workspace}/layers.json`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene información detallada de una capa específica
   * @param {string} layerName Nombre de la capa (puede incluir el workspace, ej: 'topografia:curvas').
   * @returns {Observable<any>} Observable con los detalles técnicos de la capa.
   */
  getLayerDetails(layerName: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/layers/${layerName}.json`, {
      headers: this.getHeaders()
    });
  }

}

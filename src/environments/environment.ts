export const environment = {
  production: false,
  version: 'V. 1.0.0',
  ambiente: 'Desarrollo',

  // --- CONFIGURACIÓN DE GEOSERVER ---
  geoserver: {
    // Servidor local de desarrollo/red interna
    serverImpresionLocal: 'http://172.16.16.67:8080/geoserver',
    // Aquí puedes centralizar parámetros comunes de OGC
    workspace: 'ue003_visor', // Ajusta según tu nombre de espacio de trabajo
    formatWMS: 'image/png',
    srs: 'EPSG:4326', // O el sistema de referencia que estés usando en Perú (ej. EPSG:32718)
    transparent: true
  },

};

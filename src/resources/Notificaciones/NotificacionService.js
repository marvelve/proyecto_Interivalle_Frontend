import httpClient, { apiUrl } from "../../app/httpClient";

const NotificacionService = {
  listarTodas: async () => {
    const { json } = await httpClient(`${apiUrl}/api/notificaciones`);
    return json;
  },

  listarNoLeidas: async () => {
    const { json } = await httpClient(`${apiUrl}/api/notificaciones/no-leidas`);
    return json;
  },

  contarNoLeidas: async () => {
    const { json } = await httpClient(`${apiUrl}/api/notificaciones/contador`);
    return json;
  },

  obtenerAvance: async (idAvance) => {
    const { json } = await httpClient(`${apiUrl}/api/avances/${idAvance}`);
    return json;
  },

  marcarComoLeida: async (idNotificacion) => {
    try {
      const { json } = await httpClient(`${apiUrl}/api/notificaciones/${idNotificacion}/leer`, {
        method: "PUT",
      });
      return json;
    } catch (error) {
      console.error("No se pudo marcar la notificacion como leida", error);
      return null;
    }
  },

  marcarTodasComoLeidas: async () => {
    const { json } = await httpClient(`${apiUrl}/api/notificaciones/leer-todas`, {
      method: "PUT",
    });
    return json;
  },
};

export default NotificacionService;

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

  marcarComoLeida: async (idNotificacion) => {
    const { json } = await httpClient(`${apiUrl}/api/notificaciones/${idNotificacion}/leer`, {
      method: "PUT",
    });
    return json;
  },

  marcarTodasComoLeidas: async () => {
    const { json } = await httpClient(`${apiUrl}/api/notificaciones/leer-todas`, {
      method: "PUT",
    });
    return json;
  },
};

export default NotificacionService;
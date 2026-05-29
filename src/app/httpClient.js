import { fetchUtils } from "react-admin";

export const apiUrl = "http://localhost:8081";

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
  }

  const token = localStorage.getItem("token");
  const idUsuario = localStorage.getItem("idUsuario");

  // Agrega el token JWT a las peticiones protegidas.
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }

  // Algunas rutas antiguas usan este header para identificar el usuario.
  if (idUsuario) {
    options.headers.set("X-USER-ID", idUsuario);
  }

  return fetchUtils.fetchJson(url, options);
};

export { httpClient };
export default httpClient;

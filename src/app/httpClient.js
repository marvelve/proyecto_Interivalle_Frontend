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

  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }

  if (idUsuario) {
    options.headers.set("X-USER-ID", idUsuario);
  }

  return fetchUtils.fetchJson(url, options);
};

export { httpClient };
export default httpClient;
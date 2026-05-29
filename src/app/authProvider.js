import { apiUrl } from "./httpClient";

const LOGIN_ENDPOINT = `${apiUrl}/api/auth/login`;

const limpiarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tipo");
  localStorage.removeItem("correoUsuario");
  localStorage.removeItem("idRol");
};

const obtenerRutaInicial = (idRol) => {
  // Admin y supervisor entran a cotizaciones. Cliente entra a crear solicitud.
  return idRol === "1" || idRol === "2"
    ? "/cotizaciones"
    : "/solicitudes/create";
};

const authProvider = {
  login: async ({ username, password }) => {
    try {
      // Envia las credenciales al endpoint publico de login.
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correoUsuario: username,
          contrasenaUsuario: password,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Correo o contraseña incorrectos";

        // Intenta leer el mensaje que devuelva Spring Boot.
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Si la respuesta no trae JSON, se conserva el mensaje por defecto.
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const idRol = String(data.idRol ?? "");

      // Guarda los datos de sesion que usa el resto del frontend.
      localStorage.setItem("token", data.token);
      localStorage.setItem("tipo", data.tipo || "Bearer");
      localStorage.setItem("correoUsuario", data.correoUsuario || "");
      localStorage.setItem("idRol", idRol);

      return Promise.resolve({
        redirectTo: obtenerRutaInicial(idRol),
      });
    } catch (error) {
      return Promise.reject(error.message || "Error al iniciar sesión");
    }
  },

  logout: () => {
    // Cierra sesion limpiando los datos guardados en el navegador.
    limpiarSesion();
    return Promise.resolve();
  },

  checkAuth: () => {
    // React Admin usa este metodo para saber si hay sesion activa.
    return localStorage.getItem("token")
      ? Promise.resolve()
      : Promise.reject();
  },

  checkError: (error) => {
    // Si el backend responde 401 o 403, se fuerza salida de la sesion.
    if (error.status === 401 || error.status === 403) {
      limpiarSesion();
      return Promise.reject();
    }

    return Promise.resolve();
  },

  getPermissions: () => {
    // El menu y los recursos usan idRol para mostrar opciones.
    const idRol = localStorage.getItem("idRol");
    return Promise.resolve(idRol);
  },

  getIdentity: () => {
    const correoUsuario = localStorage.getItem("correoUsuario");

    if (!correoUsuario) {
      return Promise.reject();
    }

    return Promise.resolve({
      id: correoUsuario,
      fullName: correoUsuario,
    });
  },
};

export default authProvider;

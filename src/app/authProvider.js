const authProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch("http://localhost:8081/api/auth/login", {
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

        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
        } catch {
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("tipo", data.tipo || "Bearer");
      localStorage.setItem("correoUsuario", data.correoUsuario || "");
      localStorage.setItem("idRol", String(data.idRol ?? ""));

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error.message || "Error al iniciar sesión");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tipo");
    localStorage.removeItem("correoUsuario");
    localStorage.removeItem("idRol");
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem("token")
      ? Promise.resolve()
      : Promise.reject();
  },

  checkError: (error) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("tipo");
      localStorage.removeItem("correoUsuario");
      localStorage.removeItem("idRol");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => {
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
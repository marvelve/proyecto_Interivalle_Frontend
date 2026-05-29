import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { apiUrl } from "../app/httpClient";

const LOGO_URL = "/imagenes/landing/Logo_Landing.png";
const REGISTER_ENDPOINT = `${apiUrl}/api/auth/register`;

const FORM_INICIAL = {
  nombreUsuario: "",
  correoUsuario: "",
  contrasenaUsuario: "",
  celularUsuario: "",
  ciudadUsuario: "",
};

const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOLO_NUMEROS_REGEX = /^\d+$/;

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_INICIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validarFormulario = () => {
    const nuevosErrores = {};

    const nombre = form.nombreUsuario.trim();
    const correo = form.correoUsuario.trim();
    const contrasena = form.contrasenaUsuario;
    const celular = form.celularUsuario.trim();
    const ciudad = form.ciudadUsuario.trim();

    // Validacion del nombre: obligatorio, solo letras y minimo 5 letras reales.
    const soloLetrasSinEspacios = nombre.replace(/\s/g, "");
    if (!nombre) {
      nuevosErrores.nombreUsuario = "El nombre es obligatorio";
    } else if (!NOMBRE_REGEX.test(nombre)) {
      nuevosErrores.nombreUsuario = "El nombre solo debe contener letras";
    } else if (soloLetrasSinEspacios.length < 5) {
      nuevosErrores.nombreUsuario = "El nombre debe tener mínimo 5 letras";
    }

    // Validacion del correo con formato basico.
    if (!correo) {
      nuevosErrores.correoUsuario = "El correo es obligatorio";
    } else if (!CORREO_REGEX.test(correo)) {
      nuevosErrores.correoUsuario = "Ingrese un correo válido";
    }

    // Validacion de contrasena: minimo 6 caracteres, letras y numeros.
    const tieneLetras = /[A-Za-z]/.test(contrasena);
    const tieneNumeros = /\d/.test(contrasena);
    if (!contrasena) {
      nuevosErrores.contrasenaUsuario = "La contraseña es obligatoria";
    } else if (contrasena.length < 6) {
      nuevosErrores.contrasenaUsuario = "La contraseña debe tener al menos 6 caracteres";
    } else if (!tieneLetras || !tieneNumeros) {
      nuevosErrores.contrasenaUsuario = "La contraseña debe contener letras y números";
    }

    // Validacion del celular: obligatorio y solo numeros.
    if (!celular) {
      nuevosErrores.celularUsuario = "El celular es obligatorio";
    } else if (!SOLO_NUMEROS_REGEX.test(celular)) {
      nuevosErrores.celularUsuario = "El celular solo debe contener números";
    }

    // Validacion de ciudad.
    if (!ciudad) {
      nuevosErrores.ciudadUsuario = "La ciudad es obligatoria";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mientras escribe el celular, se dejan pasar solo numeros.
    const nuevoValor = name === "celularUsuario" ? value.replace(/\D/g, "") : value;

    setForm((formActual) => ({
      ...formActual,
      [name]: nuevoValor,
    }));

    // Limpia el error del campo que el usuario esta editando.
    setErrors((erroresActuales) => ({
      ...erroresActuales,
      [name]: "",
    }));
  };

  const registrar = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      // Envia el registro al backend publico de autenticacion.
      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      // Maneja errores enviados por Spring Boot.
      if (!response.ok) {
        let mensaje = "Error al registrar usuario";

        try {
          const errorData = await response.json();
          mensaje = errorData.message || errorData.error || mensaje;
        } catch {
          const text = await response.text();
          if (text) mensaje = text;
        }

        throw new Error(mensaje);
      }

      alert("Usuario registrado correctamente");
      navigate("/login");
    } catch (error) {
      alert(error.message || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={LOGO_URL} alt="Interivalle" style={styles.logo} />
        <h1 style={styles.title}>REGISTRO</h1>

        <form onSubmit={registrar}>
          <input
            name="nombreUsuario"
            placeholder="Nombre completo"
            value={form.nombreUsuario}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.nombreUsuario && (
            <p style={styles.error}>{errors.nombreUsuario}</p>
          )}

          <input
            name="correoUsuario"
            type="email"
            placeholder="Correo electrónico"
            value={form.correoUsuario}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.correoUsuario && (
            <p style={styles.error}>{errors.correoUsuario}</p>
          )}

          <div style={styles.passwordWrapper}>
            <input
              name="contrasenaUsuario"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={form.contrasenaUsuario}
              onChange={handleChange}
              style={{ ...styles.input, ...styles.passwordInput }}
            />
            <button
              type="button"
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              title={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              onClick={() => setShowPassword((visible) => !visible)}
              onMouseDown={(event) => event.preventDefault()}
              style={styles.passwordToggle}
            >
              {showPassword ? (
                <Visibility fontSize="small" />
              ) : (
                <VisibilityOff fontSize="small" />
              )}
            </button>
          </div>
          {errors.contrasenaUsuario && (
            <p style={styles.error}>{errors.contrasenaUsuario}</p>
          )}

          <input
            name="celularUsuario"
            placeholder="Celular"
            value={form.celularUsuario}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.celularUsuario && (
            <p style={styles.error}>{errors.celularUsuario}</p>
          )}

          <input
            name="ciudadUsuario"
            placeholder="Ciudad"
            value={form.ciudadUsuario}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.ciudadUsuario && (
            <p style={styles.error}>{errors.ciudadUsuario}</p>
          )}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>
      <div style={styles.registerBox}>
        <p style={styles.text}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={styles.link}>
            Inicia sesión
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  logo: {
    width: "270px",
    maxWidth: "100%",
    height: "auto",
    marginBottom: "18px",
  },
  title: {
    margin: "0 0 25px",
    fontSize: "32px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "4px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  passwordWrapper: {
    position: "relative",
    marginTop: "8px",
    marginBottom: "4px",
  },
  passwordInput: {
    marginTop: 0,
    marginBottom: 0,
    paddingRight: "48px",
  },
  passwordToggle: {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    width: "34px",
    height: "34px",
    border: "none",
    background: "transparent",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  error: {
    color: "#d32f2f",
    fontSize: "13px",
    textAlign: "left",
    marginTop: "0",
    marginBottom: "10px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0a8f08",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
   registerBox: {
    marginTop: "22px",
    padding: "14px 16px",
    borderRadius: "10px",
    backgroundColor: "#ecfdf3",
    border: "1px solid #bbf7d0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  text: {
    marginTop: "18px",
    fontSize: "14px",
  },
  link: {
    color: "#0a8f08",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: "17px",
  },
};

export default Register;

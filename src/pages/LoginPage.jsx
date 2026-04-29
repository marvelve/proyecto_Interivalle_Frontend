import { useState } from "react";
import { useLogin, useNotify } from "react-admin";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const login = useLogin();
  const notify = useNotify();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form);
    } catch (error) {
      notify("Correo o contraseña incorrectos", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Iniciar Sesión</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="username"
            placeholder="Correo electrónico"
            value={form.username}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p style={styles.text}>
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={styles.link}>
            Regístrate aquí
          </Link>
        </p>
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
    maxWidth: "400px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: "25px",
    fontSize: "32px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
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
  },
  text: {
    marginTop: "18px",
    fontSize: "14px",
  },
  link: {
    color: "#0a8f08",
    fontWeight: "bold",
    textDecoration: "none",
  },
};

export default LoginPage;
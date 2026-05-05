import { useState } from "react";
import { useLogin, useNotify } from "react-admin";
import { Link } from "react-router-dom";

const LOGO_URL = "/imagenes/landing/Logo_Landing.png";

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
        <img src={LOGO_URL} alt="Interivalle" style={styles.logo} />
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

        <div style={styles.registerBox}>
          <span style={styles.registerText}>¿No tienes cuenta?</span>
          <Link to="/register" style={styles.link}>
            Regístrate aquí
          </Link>
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
    padding: "32px 20px",
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    padding: "42px 44px",
    borderRadius: "12px",
    boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
    textAlign: "center",
  },
  logo: {
    width: "270px",
    maxWidth: "100%",
    height: "auto",
    marginBottom: "18px",
  },
  title: {
    margin: "0 0 28px",
    fontSize: "36px",
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#111827",
  },
  input: {
    width: "100%",
    padding: "15px 16px",
    marginBottom: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#0a8f08",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "17px",
    fontWeight: 700,
    cursor: "pointer",
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
  registerText: {
    color: "#111827",
    fontSize: "16px",
  },
  link: {
    color: "#0a8f08",
    fontWeight: 800,
    textDecoration: "none",
    fontSize: "17px",
  },
};

export default LoginPage;

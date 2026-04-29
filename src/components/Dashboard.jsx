import logo from "../assets/Logo_interivalle.jpg";

const Dashboard = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Bienvenido</h1>

        <img
          src={logo}
          alt="Logo Interivalle"
          style={styles.logo}
        />

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: "20px",
  },
  card: {
    textAlign: "center",
    backgroundColor: "#ffffff",
    padding: "40px 30px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "52px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#000",
  },
  logo: {
    width: "200px",
    maxWidth: "100%",
    border: "2px solid #1dbb2f",
    borderRadius: "14px",
    padding: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    marginBottom: "30px",
  },
};

export default Dashboard;
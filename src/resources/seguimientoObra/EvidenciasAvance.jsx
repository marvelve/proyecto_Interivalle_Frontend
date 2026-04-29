import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import {apiUrl} from "../../app/httpClient";
import CloseIcon from "@mui/icons-material/Close";

const EvidenciasAvance = ({ idAvance }) => {
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const idRol = Number(localStorage.getItem("idRol"));
  const [openImagen, setOpenImagen] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  const puedeSubir = idRol === 1 || idRol === 2;

  const cargarEvidencias = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${apiUrl}/api/evidencias/avance/${idAvance}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || "No se pudieron cargar las evidencias"
        );
      }

      const data = await response.json();
      setEvidencias(data || []);
    } catch (error) {
      console.error("Error cargando evidencias:", error);
      alert(error.message || "No se pudieron cargar las evidencias");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirImagen = (url, nombre) => {
  setImagenSeleccionada({ url, nombre });
  setOpenImagen(true);
};

const handleCerrarImagen = () => {
  setOpenImagen(false);
  setImagenSeleccionada(null);
};
  useEffect(() => {
    if (idAvance) {
      cargarEvidencias();
    }
  }, [idAvance]);

  const handleArchivoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);
    }
  };

  const handleSubir = async () => {
    if (!archivo) {
      alert("Debe seleccionar un archivo");
      return;
    }

    try {
      setGuardando(true);

      const formData = new FormData();
      formData.append("idAvance", idAvance);
      formData.append("descripcion", descripcion || "");
      formData.append("archivo", archivo);

      const response = await fetch(`${apiUrl}/api/evidencias/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "No se pudo subir la evidencia");
      }

      setDescripcion("");
      setArchivo(null);

      const inputFile = document.getElementById("input-archivo-evidencia");
      if (inputFile) inputFile.value = "";

      await cargarEvidencias();
      alert("Evidencia subida correctamente");
    } catch (error) {
      console.error("Error subiendo evidencia:", error);
      alert(error.message || "No se pudo subir la evidencia");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Evidencias del avance
        </Typography>

        {puedeSubir && (
          <Box mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <input
                  id="input-archivo-evidencia"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleArchivoChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubir}
                  disabled={guardando}
                >
                  {guardando ? "Subiendo..." : "Subir evidencia"}
                </Button>
              </Grid>
            </Grid>

            {archivo && (
              <Typography variant="body2" mt={2}>
                Archivo seleccionado: {archivo.name}
              </Typography>
            )}
          </Box>
        )}

        {loading ? (
          <Typography>Cargando evidencias...</Typography>
        ) : evidencias.length === 0 ? (
          <Typography>No hay evidencias registradas para este avance.</Typography>
        ) : (
          <Grid container spacing={2}>
            {evidencias.map((ev) => {
                 console.log("urlArchivo:", ev.urlArchivo);
             // const urlCompleta = `${apiUrl}${ev.urlArchivo}`;
                const urlCompleta = !ev.urlArchivo
                    ? ""
                    : ev.urlArchivo.startsWith("http")
                        ? ev.urlArchivo
                        : `${apiUrl}${ev.urlArchivo.startsWith("/") ? "" : "/"}${ev.urlArchivo}`;
                 console.log("urlArchivo:", ev.urlArchivo);
              return (
                <Grid item xs={12} md={6} lg={4} key={ev.idEvidencia}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography fontWeight="bold">
                          {ev.tipoArchivo || "EVIDENCIA"}
                        </Typography>

                        <Typography variant="body2">
                          {ev.descripcion || "Sin descripción"}
                        </Typography>

                        {ev.tipoArchivo === "FOTO" ? (
                          <Box
                            component="img"
                            src={urlCompleta}
                            alt={ev.nombreArchivo}
                            onClick={() => handleAbrirImagen(urlCompleta, ev.nombreArchivo)}
                            sx={{
                            width: "100%",
                            maxHeight: 220,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid #ddd",
                            cursor: "pointer",
                            transition: "0.2s",
                            "&:hover": {
                                transform: "scale(1.02)",
                            },
                            }}
                        />
                        ) : (
                          <video
                            controls
                            width="90%"
                            style={{ borderRadius: 8, border: "1px solid #ddd" }}
                          >
                            <source src={urlCompleta} />
                            Tu navegador no soporta video.
                          </video>
                        )}

                        <Typography variant="caption" color="text.secondary">
                          {ev.nombreArchivo}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
            <Dialog
                    open={openImagen}
                    onClose={handleCerrarImagen}
                    maxWidth="md"
                    fullWidth
                    >
                    <Box display="flex" justifyContent="flex-end" p={1}>
                        <IconButton onClick={handleCerrarImagen}>
                        <CloseIcon />
                        </IconButton>
                    </Box>

                    <DialogContent sx={{ textAlign: "center" }}>
                        {imagenSeleccionada && (
                        <>
                            <Box
                            component="img"
                            src={imagenSeleccionada.url}
                            alt={imagenSeleccionada.nombre}
                            sx={{
                                width: "100%",
                                maxHeight: "80vh",
                                objectFit: "contain",
                                borderRadius: 2,
                            }}
                            />
                            <Typography variant="body2" mt={2}>
                            {imagenSeleccionada.nombre}
                            </Typography>
                        </>
                        )}
                    </DialogContent>
                    </Dialog>
      </CardContent>
    </Card>
  );
};

export default EvidenciasAvance;
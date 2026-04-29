import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { listarComentarios, crearComentario } from "./seguimientoService";

const ComentariosAvance = ({ idAvance }) => {
  const [comentarios, setComentarios] = useState([]);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const idRol = Number(localStorage.getItem("idRol"));
  const puedeComentar = idRol === 1 || idRol === 2 || idRol === 3;

  const cargarComentarios = async () => {
    try {
      setLoading(true);
      const data = await listarComentarios(idAvance);
      setComentarios(data || []);
    } catch (error) {
      console.error("Error cargando comentarios:", error);
      alert(error.message || "No se pudieron cargar los comentarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idAvance) {
      cargarComentarios();
    }
  }, [idAvance]);

  const handleGuardar = async () => {
    if (!comentario.trim()) {
      alert("Debe escribir un comentario");
      return;
    }

    try {
      setGuardando(true);

      await crearComentario({
        idAvance,
        comentario: comentario.trim(),
      });

      setComentario("");
      await cargarComentarios();
    } catch (error) {
      console.error("Error guardando comentario:", error);
      alert(error.message || "No se pudo guardar el comentario");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Comentarios del avance
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Typography>Cargando comentarios...</Typography>
        ) : comentarios.length === 0 ? (
          <Typography>No hay comentarios registrados.</Typography>
        ) : (
          <Box mb={3}>
            <Stack spacing={2}>
              {comentarios.map((item) => (
                <Box
                  key={item.idComentario}
                  sx={{
                    p: 2,
                    border: "1px solid #E0E0E0",
                    borderRadius: 2,
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <Typography fontWeight="bold">
                    {item.nombreUsuario || "Usuario"}
                  </Typography>

                  <Typography variant="body2" mt={1}>
                    {item.comentario}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" mt={1} display="block">
                    {item.fechaComentario || ""}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {puedeComentar && (
          <Box>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Escribir comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />

            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleGuardar}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Comentar"}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ComentariosAvance;
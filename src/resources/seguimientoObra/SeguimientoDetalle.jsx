import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import EvidenciasAvance from "./EvidenciasAvance";
import ComentariosAvance from "./ComentariosAvance";

const SeguimientoDetalle = ({ avance, onCerrar }) => {
  if (!avance) return null;

  return (
    <Dialog open={!!avance} onClose={onCerrar} maxWidth="lg" fullWidth>
      <DialogTitle>Detalle del avance semanal</DialogTitle>

      <DialogContent>
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="bold">
                Semana {avance.numeroSemana}
              </Typography>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Título
                </Typography>
                <Typography fontWeight="bold">
                  {avance.titulo || "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Descripción
                </Typography>
                <Typography>
                  {avance.descripcion || "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Observaciones
                </Typography>
                <Typography>
                  {avance.observaciones || "Sin observaciones"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Porcentaje de la semana
                </Typography>
                <Typography>
                  {avance.porcentajeSemana || 0}%
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Porcentaje general
                </Typography>
                <Typography>
                  {avance.porcentajeGeneral || 0}%
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Estado
                </Typography>
                <Typography>
                  {avance.estado || "REGISTRADO"}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <EvidenciasAvance idAvance={avance.idAvance} />
        <ComentariosAvance idAvance={avance.idAvance} />

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button variant="outlined" onClick={onCerrar}>
            Cerrar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SeguimientoDetalle;
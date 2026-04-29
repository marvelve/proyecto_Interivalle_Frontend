import * as React from "react";
import { useRedirect } from "react-admin";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const SolicitudVacia = () => {
  const redirect = useRedirect();

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Card sx={{ maxWidth: 500, width: "100%", textAlign: "center", p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            No tienes solicitudes registradas
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={3}>
            Crea una nueva solicitud para iniciar una cotización o una visita técnica.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => redirect("/solicitudes/create")}
            sx={{
              borderRadius: 3,
              fontWeight: "bold",
              backgroundColor: "#0aa000",
              "&:hover": {
                backgroundColor: "#088500",
              },
            }}
          >
            Crear Solicitud
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SolicitudVacia;
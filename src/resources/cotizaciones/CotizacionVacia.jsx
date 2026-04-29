import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRedirect } from "react-admin";

const CotizacionVacia = () => {
  const redirect = useRedirect();

  return (
    <Card
      sx={{
        maxWidth: 600,
        margin: "40px auto",
        textAlign: "center",
        borderRadius: 3,
        boxShadow: 3,
        padding: 2,
      }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Aún no tiene cotizaciones generadas
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Debe crear una solicitud para iniciar una cotización o una visita técnica.
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => redirect("/solicitudes/nueva")}
          sx={{
            backgroundColor: "green",
            borderRadius: "14px",
            paddingX: 4,
            paddingY: 1.5,
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "darkgreen",
            },
          }}
        >
          CREAR SOLICITUD
        </Button>
      </CardContent>
    </Card>
  );
};

export default CotizacionVacia;
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../app/httpClient";

const ItemLabel = ({ label, value }) => (
  <Box mb={1}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="500">
      {value ?? "-"}
    </Typography>
  </Box>
);

const money = (value) => {
  if (value === null || value === undefined || value === "") return "$ 0";
  return Number(value).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};

const numberFormat = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const CotizacionPersonalizadaDetalle = () => {
  const { idCotizacion } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [loading, setLoading] = React.useState(true);
  const [detalle, setDetalle] = React.useState(null);

  const cargarDetalle = React.useCallback(async () => {
    try {
      setLoading(true);

      const { json } = await httpClient(
        `${apiUrl}/api/cotizaciones-personalizadas/${idCotizacion}/detalle`,
        {
          method: "GET",
        }
      );

      setDetalle(json);
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "Error al cargar el detalle de la cotización",
        { type: "error" }
      );
    } finally {
      setLoading(false);
    }
  }, [idCotizacion, notify]);

  React.useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!detalle) {
    return (
      <Box p={4}>
        <Typography>No se encontró información de la cotización.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 1200, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            mb={3}
          >
            <Typography variant="h4" fontWeight="bold">
              Detalle Cotización Personalizada
            </Typography>

            <Box display="flex" gap={2}>
              <Button variant="outlined" onClick={() => navigate("/solicitudes")}>
                Volver
              </Button>
              <Button variant="outlined" onClick={cargarDetalle}>
                Recargar
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: "#f7f9fc",
              borderRadius: 2,
              p: 2,
              mb: 3,
              border: "1px solid #e0e0e0",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <ItemLabel label="Id Cotización" value={detalle.idCotizacion} />
              </Grid>
              <Grid item xs={12} md={3}>
                <ItemLabel label="Id Solicitud" value={detalle.idSolicitud} />
              </Grid>
              <Grid item xs={12} md={3}>
                <ItemLabel label="Id Usuario" value={detalle.idUsuario} />
              </Grid>
              <Grid item xs={12} md={3}>
                <ItemLabel label="Estado" value={detalle.estado} />
              </Grid>
              <Grid item xs={12} md={6}>
                <ItemLabel label="Nombre del Proyecto" value={detalle.nombreProyecto} />
              </Grid>
              <Grid item xs={12} md={3}>
                <ItemLabel label="Fecha Cotización" value={detalle.fechaCotizacion} />
              </Grid>
              <Grid item xs={12} md={3}>
                <ItemLabel label="Subtotal" value={money(detalle.subtotal)} />
              </Grid>
              <Grid item xs={12}>
                <ItemLabel
                  label="Observación General"
                  value={detalle.observacionGeneral || "Sin observaciones"}
                />
              </Grid>
            </Grid>
          </Box>

          {detalle.obraBlanca?.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Mano de Obra / Obra Blanca
              </Typography>
              {detalle.obraBlanca.map((item, index) => (
                <Card
                  key={item.idObraBlanca || index}
                  sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Actividad" value={item.actividad} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Lugar" value={item.lugar} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Unidad" value={item.unidad} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Cantidad" value={numberFormat(item.cantidad)} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Semanas" value={numberFormat(item.semanas)} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel
                          label="Precio Unitario"
                          value={money(item.precioUnitario)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Medida" value={numberFormat(item.medida)} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Subtotal" value={money(item.subtotal)} />
                      </Grid>
                      <Grid item xs={12}>
                        <ItemLabel label="Descripción" value={item.descripcion} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {detalle.carpinteria?.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Carpintería
              </Typography>
              {detalle.carpinteria.map((item, index) => (
                <Card
                  key={item.idCarpinteria || index}
                  sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Tipo de Mueble" value={item.tipoMueble} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Material" value={item.material} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Largo" value={numberFormat(item.largo)} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Ancho" value={numberFormat(item.ancho)} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Alto" value={numberFormat(item.alto)} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Cantidad" value={numberFormat(item.cantidad)} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel
                          label="Precio Unitario"
                          value={money(item.precioUnitario)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Subtotal" value={money(item.subtotal)} />
                      </Grid>
                      <Grid item xs={12}>
                        <ItemLabel label="Descripción" value={item.descripcion} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {detalle.vidrio?.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Divisiones en Vidrio
              </Typography>
              {detalle.vidrio.map((item, index) => (
                <Card
                  key={item.idVidrio || index}
                  sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Tipo de Vidrio" value={item.tipoVidrio} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Ancho" value={numberFormat(item.ancho)} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Alto" value={numberFormat(item.alto)} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Cantidad" value={numberFormat(item.cantidad)} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel
                          label="Instalación"
                          value={item.instalacion ? "Sí" : "No"}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel
                          label="Precio Unitario"
                          value={money(item.precioUnitario)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Subtotal" value={money(item.subtotal)} />
                      </Grid>
                      <Grid item xs={12}>
                        <ItemLabel label="Descripción" value={item.descripcion} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {detalle.mesonGranito?.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Mesón Granito
              </Typography>
              {detalle.mesonGranito.map((item, index) => (
                <Card
                  key={item.idMeson || index}
                  sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Tipo de Granito" value={item.tipoGranito} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Largo" value={numberFormat(item.largo)} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Ancho" value={numberFormat(item.ancho)} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ItemLabel label="Espesor" value={numberFormat(item.espesor)} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Cantidad" value={numberFormat(item.cantidad)} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel
                          label="Precio Unitario"
                          value={money(item.precioUnitario)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <ItemLabel label="Subtotal" value={money(item.subtotal)} />
                      </Grid>
                      <Grid item xs={12}>
                        <ItemLabel label="Descripción" value={item.descripcion} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="flex-end">
            <Card
              sx={{
                minWidth: 320,
                borderRadius: 3,
                backgroundColor: "#f8fff8",
                border: "1px solid #d6f0d6",
                boxShadow: 1,
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Resumen Total
                </Typography>
                <Typography variant="body1" mb={1}>
                  Subtotal: <strong>{money(detalle.subtotal)}</strong>
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  Total: {money(detalle.total)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CotizacionPersonalizadaDetalle;
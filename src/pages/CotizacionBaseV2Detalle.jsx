import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useNotify } from "react-admin";
import { useNavigate, useParams } from "react-router-dom";
import httpClient, { apiUrl } from "../app/httpClient";

const estilosTabla = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 12,
  },
  th: {
    border: "1px solid #d9d9d9",
    padding: 8,
    background: "#f3f6f3",
    fontWeight: 700,
    textAlign: "left",
  },
  td: {
    border: "1px solid #d9d9d9",
    padding: 8,
    verticalAlign: "top",
  },
};

const formatearMoneda = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(valor || 0));

const formatearNumero = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "-";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(valor || 0));
};

const toNumber = (valor) => Number(valor || 0);

const normalizarTipo = (valor) => String(valor || "").trim().toUpperCase();

const CotizacionBaseV2Detalle = () => {
  const { idCotizacion } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const cargarDetalles = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const { json } = await httpClient(
        `${apiUrl}/api/pruebas/cotizacion-base-v2/${idCotizacion}/detalles`
      );
      setData(json);
    } catch (requestError) {
      console.error("Error cargando detalles V2:", requestError);
      const mensaje =
        requestError?.body?.message ||
        requestError?.message ||
        "No se pudieron cargar los detalles V2.";

      setError(mensaje);
      notify(mensaje, { type: "error" });
    } finally {
      setCargando(false);
    }
  }, [idCotizacion, notify]);

  useEffect(() => {
    cargarDetalles();
  }, [cargarDetalles]);

  const detalles = useMemo(() => data?.detalles || [], [data]);

  const detallesOrdenados = useMemo(
    () =>
      [...detalles].sort((a, b) => {
        const semanaA = Number(a.semana || 0);
        const semanaB = Number(b.semana || 0);

        if (semanaA !== semanaB) {
          return semanaA - semanaB;
        }

        return String(a.tipoItem || "").localeCompare(String(b.tipoItem || ""));
      }),
    [detalles]
  );

  const totales = useMemo(
    () =>
      detalles.reduce(
        (acumulado, detalle) => {
          const subtotal = toNumber(detalle.subtotalVenta);
          const tipo = normalizarTipo(detalle.tipoItem);

          if (tipo === "ACTIVIDAD") {
            acumulado.totalManoObra += subtotal;
          } else if (tipo === "MATERIAL") {
            acumulado.totalMateriales += subtotal;
          } else if (tipo === "PRODUCTO") {
            acumulado.totalProductos += subtotal;
          }

          acumulado.totalGeneral += subtotal;
          return acumulado;
        },
        {
          totalManoObra: 0,
          totalMateriales: 0,
          totalProductos: 0,
          totalGeneral: 0,
        }
      ),
    [detalles]
  );

  if (cargando) {
    return (
      <Box p={4} display="flex" alignItems="center" gap={1.5}>
        <CircularProgress size={24} />
        <Typography>Cargando detalles V2...</Typography>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
          mb={3}
        >
          <Box>
            <Typography variant="h3" fontWeight="bold">
              Detalle Cotizacion Base V2
            </Typography>
            <Typography color="text.secondary">
              Cotizacion #{data?.idCotizacion || idCotizacion}
            </Typography>
          </Box>

          <Box display="flex" gap={1.5} flexWrap="wrap">
            <Button variant="outlined" onClick={() => navigate("/cotizacion-base-v2")}>
              Nueva prueba
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate(`/cotizaciones/${idCotizacion}/vista`)}
            >
              Ver cotizacion
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography color="text.secondary">Mano de obra</Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatearMoneda(totales.totalManoObra)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography color="text.secondary">Materiales</Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatearMoneda(totales.totalMateriales)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography color="text.secondary">Productos</Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatearMoneda(totales.totalProductos)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography color="text.secondary">Total</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {formatearMoneda(totales.totalGeneral)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Registros generados ({data?.cantidadDetalles ?? detalles.length})
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <table style={estilosTabla.table}>
            <thead>
              <tr>
                <th style={estilosTabla.th}>Semana</th>
                <th style={estilosTabla.th}>Servicio</th>
                <th style={estilosTabla.th}>Tipo</th>
                <th style={estilosTabla.th}>Categoria</th>
                <th style={estilosTabla.th}>Descripcion</th>
                <th style={estilosTabla.th}>Actividad / material</th>
                <th style={estilosTabla.th}>Cantidad</th>
                <th style={estilosTabla.th}>Unidad</th>
                <th style={estilosTabla.th}>Precio unitario</th>
                <th style={estilosTabla.th}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detallesOrdenados.length > 0 ? (
                detallesOrdenados.map((detalle, index) => (
                  <tr key={detalle.idDetalle || index}>
                    <td style={estilosTabla.td}>{detalle.semana || "-"}</td>
                    <td style={estilosTabla.td}>{detalle.nombreServicio || "-"}</td>
                    <td style={estilosTabla.td}>{detalle.tipoItem || "-"}</td>
                    <td style={estilosTabla.td}>{detalle.categoria || "-"}</td>
                    <td style={estilosTabla.td}>{detalle.descripcion || "-"}</td>
                    <td style={estilosTabla.td}>
                      {detalle.actividadMaterial || "-"}
                    </td>
                    <td style={estilosTabla.td}>
                      {formatearNumero(detalle.cantidad)}
                    </td>
                    <td style={estilosTabla.td}>{detalle.unidad || "-"}</td>
                    <td style={estilosTabla.td}>
                      {formatearMoneda(detalle.precioUnitarioVenta)}
                    </td>
                    <td style={estilosTabla.td}>
                      {formatearMoneda(detalle.subtotalVenta)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={estilosTabla.td} colSpan={10}>
                    No hay detalles generados para esta cotizacion.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};

export default CotizacionBaseV2Detalle;

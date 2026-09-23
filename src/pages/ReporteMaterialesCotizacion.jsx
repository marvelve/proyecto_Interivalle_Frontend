import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import { useNotify, usePermissions } from "react-admin";
import { apiUrl, httpClient } from "../app/httpClient";

const emptyFilters = {
  idCotizacion: "",
  nombreProyecto: "",
  cliente: "",
  servicio: "",
  estado: "",
};

const estados = [
  "GENERADA",
  "ENVIADA",
  "EN_REVISION",
  "APROBADA",
  "APROBADA_CLIENTE",
  "APROBADA_FINAL",
  "RECHAZADA",
];

const money = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const number = (value) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(
    Number(value || 0)
  );

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const exportarExcel = (reporte) => {
  const fila = (values) =>
    `<tr>${values.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`;
  const encabezado = (values) =>
    `<tr>${values.map((value) => `<th>${escapeHtml(value)}</th>`).join("")}</tr>`;

  const html = `<html><head><meta charset="utf-8"></head><body>
    <h1>Reporte de materiales por cotización #${reporte.idCotizacion}</h1>
    <p>Proyecto: ${escapeHtml(reporte.nombreProyecto)} | Cliente: ${escapeHtml(
      reporte.cliente
    )} | Estado: ${escapeHtml(reporte.estado)}</p>
    <h2>Materiales de la cotización base</h2>
    <table border="1">
      ${encabezado([
        "Cliente", "Servicio", "Actividad", "Material", "Unidad",
        "Cantidad", "Precio unitario", "Subtotal",
      ])}
      ${(reporte.materiales || [])
        .map((item) =>
          fila([
            item.cliente, item.servicio, item.actividad, item.material,
            item.unidad, item.cantidad, item.precioUnitario, item.subtotal,
          ])
        )
        .join("")}
    </table>
    <h2>Actividades adicionales</h2>
    <table border="1">
      ${encabezado([
        "Servicio", "Actividad", "Lugar o zona", "Unidad", "Cantidad",
        "Medida", "Precio unitario", "Subtotal",
      ])}
      ${(reporte.actividadesAdicionales || [])
        .map((item) =>
          fila([
            item.servicio, item.actividad, item.lugar, item.unidad,
            item.cantidad, item.medida, item.precioUnitario, item.subtotal,
          ])
        )
        .join("")}
    </table>
    <h2>Resumen</h2>
    <table border="1">
      ${fila(["Total de materiales", reporte.totalMateriales])}
      ${fila(["Total de actividades adicionales", reporte.totalActividadesAdicionales])}
      ${fila(["Total general de la cotización", reporte.totalGeneral])}
    </table>
  </body></html>`;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `materiales_cotizacion_${reporte.idCotizacion}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const EmptyRow = ({ columns, message }) => (
  <TableRow>
    <TableCell colSpan={columns} align="center">
      {message}
    </TableCell>
  </TableRow>
);

const ReporteMaterialesCotizacion = () => {
  const notify = useNotify();
  const { permissions, isPending: permissionsPending } = usePermissions();
  const [filters, setFilters] = useState(emptyFilters);
  const [resultados, setResultados] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [consultado, setConsultado] = useState(false);

  const reporte = useMemo(
    () =>
      resultados.find(
        (item) => String(item.idCotizacion) === String(selectedId)
      ) || null,
    [resultados, selectedId]
  );

  const consultar = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (String(value).trim()) params.set(key, String(value).trim());
      });
      const { json } = await httpClient(
        `${apiUrl}/api/reportes/materiales-cotizacion?${params.toString()}`
      );
      const data = Array.isArray(json) ? json : [];
      setResultados(data);
      setSelectedId(data.length === 1 ? String(data[0].idCotizacion) : "");
      setConsultado(true);
      if (!data.length) notify("No se encontraron cotizaciones", { type: "info" });
    } catch (error) {
      notify(error?.body?.message || error?.message || "No fue posible consultar el reporte", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (permissionsPending) return <CircularProgress size={28} />;
  if (!["1", "2"].includes(String(permissions))) {
    return <Alert severity="error">No tienes permisos para consultar este reporte.</Alert>;
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" fontWeight={900} color="#1b5e20">
          Reporte de materiales por cotización
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consulta en modo lectura los materiales base y las actividades adicionales.
        </Typography>
      </Box>

      <Paper component="form" onSubmit={consultar} variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth label="N.º de cotización" type="number" size="small"
              value={filters.idCotizacion}
              onChange={(e) => setFilters({ ...filters, idCotizacion: e.target.value })}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth label="Nombre del proyecto" size="small"
              value={filters.nombreProyecto}
              onChange={(e) => setFilters({ ...filters, nombreProyecto: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth label="Cliente" size="small" value={filters.cliente}
              onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth label="Servicio" size="small" value={filters.servicio}
              onChange={(e) => setFilters({ ...filters, servicio: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={1.8}>
            <TextField
              select fullWidth label="Estado" size="small" value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              {estados.map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md="auto">
            <Button type="submit" variant="contained" startIcon={<SearchIcon />} disabled={loading}>
              Consultar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {resultados.length > 1 && (
        <Alert severity="info">
          Se encontraron {resultados.length} cotizaciones. Selecciona una para generar el reporte.
        </Alert>
      )}

      {resultados.length > 0 && (
        <TextField
          select label="Cotización seleccionada" size="small" value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          sx={{ maxWidth: 520 }}
        >
          <MenuItem value="" disabled>Selecciona una cotización</MenuItem>
          {resultados.map((item) => (
            <MenuItem key={item.idCotizacion} value={String(item.idCotizacion)}>
              #{item.idCotizacion} — {item.nombreProyecto} — {item.cliente}
            </MenuItem>
          ))}
        </TextField>
      )}

      {consultado && !loading && !resultados.length && (
        <Alert severity="info">No hay información para los filtros indicados.</Alert>
      )}

      {reporte && (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Cotización #{reporte.idCotizacion} · {reporte.nombreProyecto}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reporte.cliente} · {reporte.estado}
              </Typography>
            </Box>
            <Button
              variant="outlined" startIcon={<FileDownloadIcon />}
              onClick={() => exportarExcel(reporte)}
            >
              Descargar Excel
            </Button>
          </Stack>

          <Box>
            <Typography variant="h6" fontWeight={800} mb={1}>Materiales de la cotización base</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: "#e8f5e9" }}>
                  <TableRow>
                    {["Cliente", "Servicio", "Actividad", "Material", "Unidad", "Cantidad", "Precio unitario", "Subtotal"].map((label) => (
                      <TableCell key={label} sx={{ fontWeight: 800 }}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!reporte.materiales?.length && <EmptyRow columns={8} message="Esta cotización no tiene materiales base." />}
                  {(reporte.materiales || []).map((item, index) => (
                    <TableRow key={`${item.numeroCotizacion}-${index}`}>
                      <TableCell>{item.cliente}</TableCell>
                      <TableCell>{item.servicio}</TableCell>
                      <TableCell>{item.actividad || "-"}</TableCell>
                      <TableCell>{item.material}</TableCell>
                      <TableCell>{item.unidad || "-"}</TableCell>
                      <TableCell align="right">{number(item.cantidad)}</TableCell>
                      <TableCell align="right">{money(item.precioUnitario)}</TableCell>
                      <TableCell align="right">{money(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={800} mb={1}>Actividades adicionales</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: "#e3f2fd" }}>
                  <TableRow>
                    {["Servicio", "Actividad adicional", "Lugar o zona", "Unidad", "Cantidad", "Medida", "Precio unitario", "Subtotal"].map((label) => (
                      <TableCell key={label} sx={{ fontWeight: 800 }}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!reporte.actividadesAdicionales?.length && <EmptyRow columns={8} message="Esta cotización no tiene actividades adicionales." />}
                  {(reporte.actividadesAdicionales || []).map((item, index) => (
                    <TableRow key={`${item.actividad}-${item.lugar}-${index}`}>
                      <TableCell>{item.servicio}</TableCell>
                      <TableCell>{item.actividad}</TableCell>
                      <TableCell>{item.lugar || "-"}</TableCell>
                      <TableCell>{item.unidad || "-"}</TableCell>
                      <TableCell align="right">{number(item.cantidad)}</TableCell>
                      <TableCell align="right">{number(item.medida)}</TableCell>
                      <TableCell align="right">{money(item.precioUnitario)}</TableCell>
                      <TableCell align="right">{money(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Grid container spacing={1.5}>
            {[
              ["Total de materiales", reporte.totalMateriales],
              ["Total de actividades adicionales", reporte.totalActividadesAdicionales],
              ["Total general de la cotización", reporte.totalGeneral],
            ].map(([label, value], index) => (
              <Grid item xs={12} md={4} key={label}>
                <Paper variant="outlined" sx={{ p: 2, borderColor: index === 2 ? "#2e7d32" : undefined }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="h5" fontWeight={900} color={index === 2 ? "#1b5e20" : "text.primary"}>
                    {money(value)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Stack>
  );
};

export default ReporteMaterialesCotizacion;

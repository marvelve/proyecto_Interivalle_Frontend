import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Title, useNotify } from "react-admin";
import { apiUrl, httpClient } from "../app/httpClient";
import {
  centeredPageSx,
  compactTableContainerSx,
  compactTableSx,
  tableHeaderGreen,
} from "../app/listStyles";

const COLORS = {
  green: "#2e7d32",
  greenDark: "#1b5e20",
  greenSoft: "#eef8ef",
  blue: "#1565c0",
  amber: "#ed6c02",
  red: "#c62828",
  ink: "#1f2937",
  muted: "#5f6b7a",
  border: "#d8ead9",
  white: "#ffffff",
};

const emptyFilters = {
  fechaDesde: "",
  fechaHasta: "",
  estado: "",
  servicio: "",
};

const tabs = [
  "General",
  "Solicitudes",
  "Cotizaciones",
  "Visitas tecnicas",
  "Cronogramas",
  "Avances",
  "Financiero",
];

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toIsoDate = (value) => {
  if (!value) return "";

  const text = String(value);
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/);

  if (iso) return iso[1];

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  const iso = toIsoDate(value);

  if (!iso) return "-";

  const [year, month, day] = iso.split("-").map(Number);

  return new Intl.DateTimeFormat("es-CO").format(
    new Date(year, month - 1, day)
  );
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatPercent = (value) => `${Number(value || 0).toFixed(0)}%`;

const isApproved = (estado) => normalize(estado) === "aprobada";

const isFinished = (estado) =>
  ["finalizado", "terminada", "completada"].includes(normalize(estado));

const isLateCronograma = (cronograma) => {
  const fechaFin = toIsoDate(cronograma?.fechaFin);
  const today = toIsoDate(new Date());
  const avance = Number(cronograma?.avanceGeneral || 0);

  return Boolean(
    fechaFin &&
      fechaFin < today &&
      avance < 100 &&
      !isFinished(cronograma?.estadoCronograma)
  );
};

const getSolicitudServicios = (solicitud) =>
  (solicitud?.solicitudServicios || [])
    .map((servicio) => servicio?.nombreServicio)
    .filter(Boolean);

const getCotizacionServicios = (cotizacion) =>
  (cotizacion?.serviciosSeleccionados || cotizacion?.servicios || []).filter(
    Boolean
  );

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const exportToExcel = (fileName, columns, rows) => {
  const header = columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("");

  const body = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => {
            const rawValue = column.exportValue
              ? column.exportValue(row)
              : row?.[column.key];

            return `<td>${escapeHtml(rawValue)}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <table>
          <thead><tr>${header}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${fileName}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const countBy = (items, getter) =>
  items.reduce((acc, item) => {
    const key = getter(item) || "Sin estado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

const sumBy = (items, getter) =>
  items.reduce((total, item) => total + Number(getter(item) || 0), 0);

const uniqueSorted = (items) =>
  Array.from(new Set(items.filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b), "es", { sensitivity: "base" })
  );

const matchSelect = (value, filter) =>
  !filter || normalize(value) === normalize(filter);

const matchDateRange = (value, fechaDesde, fechaHasta) => {
  const date = toIsoDate(value);

  if (!date) return !fechaDesde && !fechaHasta;
  if (fechaDesde && date < fechaDesde) return false;
  if (fechaHasta && date > fechaHasta) return false;

  return true;
};

const serviceMatches = (services, filter) => {
  if (!filter) return true;

  return services.some((service) => normalize(service) === normalize(filter));
};

const KpiCard = ({ label, value, detail, tone = "green" }) => {
  const color =
    tone === "blue"
      ? COLORS.blue
      : tone === "amber"
      ? COLORS.amber
      : tone === "red"
      ? COLORS.red
      : COLORS.green;

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: 2,
        border: `1px solid ${COLORS.border}`,
        p: 2,
      }}
    >
      <Stack spacing={0.6}>
        <Typography variant="body2" color={COLORS.muted} fontWeight={700}>
          {label}
        </Typography>
        <Typography variant="h4" color={color} fontWeight={900}>
          {value}
        </Typography>
        {detail && (
          <Typography variant="caption" color={COLORS.muted}>
            {detail}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

const SectionHeader = ({ title, right }) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={1.5}
    alignItems={{ xs: "stretch", sm: "center" }}
    justifyContent="space-between"
    sx={{ mb: 1.5 }}
  >
    <Typography variant="h6" fontWeight={900} color={COLORS.ink}>
      {title}
    </Typography>
    {right}
  </Stack>
);

const ReportTable = ({ title, exportName, columns, rows, getRowKey }) => (
  <Box>
    <SectionHeader
      title={title}
      right={
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={() => exportToExcel(exportName, columns, rows)}
          disabled={!rows.length}
          sx={{ color: COLORS.greenDark, borderColor: COLORS.green }}
        >
          Exportar Excel
        </Button>
      }
    />

    <TableContainer
      component={Paper}
      sx={{ ...compactTableContainerSx, maxHeight: 430 }}
    >
      <Table stickyHeader size="small" sx={compactTableSx}>
        <TableHead>
          <TableRow sx={{ backgroundColor: tableHeaderGreen }}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align || "left"}
                sx={{ fontWeight: "bold", width: column.width }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>Sin registros</TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={getRowKey ? getRowKey(row) : row.id || index}
                hover
              >
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align || "left"}>
                    {column.render ? column.render(row) : row?.[column.key] || "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const StatusSummary = ({ title, data }) => {
  const entries = Object.entries(data || {});

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: 2,
        p: 2,
        height: "100%",
      }}
    >
      <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Stack spacing={1}>
        {entries.length === 0 ? (
          <Typography variant="body2" color={COLORS.muted}>
            Sin datos
          </Typography>
        ) : (
          entries.map(([label, value]) => (
            <Stack
              key={label}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Chip label={label} size="small" />
              <Typography fontWeight={900}>{value}</Typography>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
};

const FiltersPanel = ({
  filters,
  setFilters,
  estadoOptions,
  servicioOptions,
  onRefresh,
  loading,
}) => (
  <Paper
    elevation={0}
    sx={{
      border: `1px solid ${COLORS.border}`,
      borderRadius: 2,
      p: 2,
      mb: 2,
      backgroundColor: COLORS.white,
    }}
  >
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(180px, 1fr))",
          md: "170px 170px 200px minmax(240px, 1fr) 184px",
        },
        gap: 1.5,
        alignItems: "center",
      }}
    >
      <Box>
        <TextField
          fullWidth
          size="small"
          label="Fecha desde"
          type="date"
          value={filters.fechaDesde}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, fechaDesde: event.target.value }))
          }
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Box>
        <TextField
          fullWidth
          size="small"
          label="Fecha hasta"
          type="date"
          value={filters.fechaHasta}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, fechaHasta: event.target.value }))
          }
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Box>
        <TextField
          select
          fullWidth
          size="small"
          label="Estado"
          value={filters.estado}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, estado: event.target.value }))
          }
        >
          <MenuItem value="">Todos</MenuItem>
          {estadoOptions.map((estado) => (
            <MenuItem key={estado} value={estado}>
              {estado}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box>
        <TextField
          select
          fullWidth
          size="small"
          label="Servicios"
          value={filters.servicio}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, servicio: event.target.value }))
          }
        >
          <MenuItem value="">Todos</MenuItem>
          {servicioOptions.map((servicio) => (
            <MenuItem key={servicio} value={servicio}>
              {servicio}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box>
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setFilters(emptyFilters)}
            sx={{ color: COLORS.greenDark, borderColor: COLORS.green }}
          >
            Limpiar
          </Button>
          <Button
            variant="contained"
            onClick={onRefresh}
            disabled={loading}
            sx={{ bgcolor: COLORS.green, "&:hover": { bgcolor: COLORS.greenDark } }}
          >
            <RefreshIcon />
          </Button>
        </Stack>
      </Box>
    </Box>
  </Paper>
);

const Reportes = () => {
  const notify = useNotify();
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solicitudes, setSolicitudes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [avances, setAvances] = useState([]);
  const [evidenciasPorAvance, setEvidenciasPorAvance] = useState({});

  const idRol = String(localStorage.getItem("idRol") || "");
  const puedeVerReportes = idRol === "1" || idRol === "2";

  const cargarReportes = async () => {
    if (!puedeVerReportes) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [{ json: solicitudesJson }, { json: cotizacionesJson }, { json: cronogramasJson }] =
        await Promise.all([
          httpClient(`${apiUrl}/api/solicitudes`),
          httpClient(`${apiUrl}/api/cotizaciones`),
          httpClient(`${apiUrl}/api/cliente/cronogramas`),
        ]);

      const cronogramaByCotizacion = new Map(
        (cronogramasJson || []).map((cronograma) => [
          Number(cronograma.idCotizacion),
          cronograma,
        ])
      );

      const cotizacionesEnriquecidas = (cotizacionesJson || []).map(
        (cotizacion) => {
          const cronograma = cronogramaByCotizacion.get(
            Number(cotizacion.idCotizacion)
          );

          return {
            ...cotizacion,
            fechaInicio: cotizacion.fechaInicio || cronograma?.fechaInicio || null,
            fechaFin: cronograma?.fechaFin || null,
          };
        }
      );

      const avanceResults = await Promise.allSettled(
        (cronogramasJson || []).map(async (cronograma) => {
          const { json } = await httpClient(
            `${apiUrl}/api/avances/cronograma/${cronograma.idCronograma}`
          );

          return (Array.isArray(json) ? json : []).map((avance) => ({
            ...avance,
            nombreProyecto: cronograma.nombreProyecto,
            nombreCliente: cronograma.nombreCliente,
            fechaInicio: cronograma.fechaInicio,
            fechaFin: cronograma.fechaFin,
            idCotizacion: cronograma.idCotizacion,
            avanceCronograma: cronograma.avanceGeneral,
          }));
        })
      );

      const avancesJson = avanceResults
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value);

      const evidenciaResults = await Promise.allSettled(
        avancesJson.map(async (avance) => {
          const { json } = await httpClient(
            `${apiUrl}/api/evidencias/avance/${avance.idAvance}`
          );

          return [avance.idAvance, Array.isArray(json) ? json.length : 0];
        })
      );

      const evidenciasMap = Object.fromEntries(
        evidenciaResults
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)
      );

      setSolicitudes(solicitudesJson || []);
      setCotizaciones(cotizacionesEnriquecidas);
      setCronogramas(cronogramasJson || []);
      setAvances(avancesJson);
      setEvidenciasPorAvance(evidenciasMap);
    } catch (err) {
      console.error("Error cargando reportes:", err);
      const message = err?.message || "No se pudieron cargar los reportes";
      setError(message);
      notify(message, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeVerReportes]);

  const lookup = useMemo(() => {
    const cotizacionById = new Map(
      cotizaciones.map((cotizacion) => [
        Number(cotizacion.idCotizacion),
        cotizacion,
      ])
    );

    return { cotizacionById };
  }, [cotizaciones]);

  const visitas = useMemo(
    () =>
      solicitudes.filter(
        (solicitud) => normalize(solicitud.tipoSolicitud) === "visita_tecnica"
      ),
    [solicitudes]
  );

  const estadoOptions = useMemo(
    () =>
      uniqueSorted([
        ...solicitudes.map((item) => item.estado),
        ...cotizaciones.map((item) => item.estado),
        ...cronogramas.map((item) => item.estadoCronograma),
        ...avances.map((item) => item.estado),
      ]),
    [solicitudes, cotizaciones, cronogramas, avances]
  );

  const servicioOptions = useMemo(
    () =>
      uniqueSorted([
        ...solicitudes.flatMap(getSolicitudServicios),
        ...cotizaciones.flatMap(getCotizacionServicios),
      ]),
    [solicitudes, cotizaciones]
  );

  const filtered = useMemo(() => {
    const common = {
      fechaDesde: filters.fechaDesde,
      fechaHasta: filters.fechaHasta,
      estado: filters.estado,
      servicio: filters.servicio,
    };

    const solicitudesFiltradas = solicitudes.filter((solicitud) => {
      const services = getSolicitudServicios(solicitud);

      return (
        matchDateRange(solicitud.fechaSolicitud, common.fechaDesde, common.fechaHasta) &&
        matchSelect(solicitud.estado, common.estado) &&
        serviceMatches(services, common.servicio)
      );
    });

    const cotizacionesFiltradas = cotizaciones.filter((cotizacion) => {
      const services = getCotizacionServicios(cotizacion);
      const fechaReporte =
        isApproved(cotizacion.estado) && cotizacion.fechaInicio
          ? cotizacion.fechaInicio
          : cotizacion.fechaCreacion;

      return (
        matchDateRange(fechaReporte, common.fechaDesde, common.fechaHasta) &&
        matchSelect(cotizacion.estado, common.estado) &&
        serviceMatches(services, common.servicio)
      );
    });

    const visitasFiltradas = visitas.filter((visita) => {
      const services = getSolicitudServicios(visita);

      return (
        matchDateRange(
          visita.fechaVisita || visita.fechaSolicitud,
          common.fechaDesde,
          common.fechaHasta
        ) &&
        matchSelect(visita.estado, common.estado) &&
        serviceMatches(services, common.servicio)
      );
    });

    const cronogramasFiltrados = cronogramas.filter((cronograma) => {
      const cotizacion = lookup.cotizacionById.get(Number(cronograma.idCotizacion));
      const services = getCotizacionServicios(cotizacion);

      return (
        matchDateRange(cronograma.fechaInicio, common.fechaDesde, common.fechaHasta) &&
        matchSelect(cronograma.estadoCronograma, common.estado) &&
        serviceMatches(services, common.servicio)
      );
    });

    const avancesFiltrados = avances.filter((avance) => {
      const cotizacion = lookup.cotizacionById.get(Number(avance.idCotizacion));
      const services = getCotizacionServicios(cotizacion);

      return (
        matchDateRange(avance.fechaRegistro, common.fechaDesde, common.fechaHasta) &&
        matchSelect(avance.estado, common.estado) &&
        serviceMatches(services, common.servicio)
      );
    });

    return {
      solicitudes: solicitudesFiltradas,
      cotizaciones: cotizacionesFiltradas,
      visitas: visitasFiltradas,
      cronogramas: cronogramasFiltrados,
      avances: avancesFiltrados,
    };
  }, [filters, solicitudes, cotizaciones, visitas, cronogramas, avances, lookup]);

  const metrics = useMemo(() => {
    const obrasActivas = filtered.cronogramas.filter(
      (cronograma) =>
        normalize(cronograma.estadoCronograma) === "en_proceso" &&
        Number(cronograma.avanceGeneral || 0) < 100
    );
    const obrasAtrasadas = filtered.cronogramas.filter(isLateCronograma);
    const cotizacionesAprobadas = filtered.cotizaciones.filter((cotizacion) =>
      isApproved(cotizacion.estado)
    );
    const totalCotizado = sumBy(
      filtered.cotizaciones,
      (cotizacion) => cotizacion.totalEstimado
    );
    const totalAprobado = sumBy(
      cotizacionesAprobadas,
      (cotizacion) => cotizacion.totalEstimado
    );

    return {
      obrasActivas,
      obrasAtrasadas,
      cotizacionesAprobadas,
      totalCotizado,
      totalAprobado,
    };
  }, [filtered]);

  const financieroPorServicio = useMemo(() => {
    const groups = {};

    metrics.cotizacionesAprobadas.forEach((cotizacion) => {
      const services = getCotizacionServicios(cotizacion);
      const serviceList = services.length ? services : ["Sin servicio"];
      const total = Number(cotizacion.totalEstimado || 0) / serviceList.length;

      serviceList.forEach((service) => {
        if (!groups[service]) {
          groups[service] = {
            servicio: service,
            cotizaciones: 0,
            totalAprobado: 0,
          };
        }

        groups[service].cotizaciones += 1;
        groups[service].totalAprobado += total;
      });
    });

    return Object.values(groups).sort(
      (a, b) => b.totalAprobado - a.totalAprobado
    );
  }, [metrics.cotizacionesAprobadas]);

  const solicitudColumns = [
    { key: "idSolicitud", label: "ID" },
    { key: "fechaSolicitud", label: "Fecha", render: (row) => formatDate(row.fechaSolicitud), exportValue: (row) => toIsoDate(row.fechaSolicitud) },
    { key: "tipoSolicitud", label: "Tipo" },
    { key: "estado", label: "Estado" },
    { key: "nombreProyecto", label: "Proyecto" },
    { key: "correoUsuario", label: "Cliente" },
    {
      key: "servicios",
      label: "Servicios",
      render: (row) => getSolicitudServicios(row).join(", ") || "-",
      exportValue: (row) => getSolicitudServicios(row).join(", "),
    },
  ];

  const cotizacionColumns = [
    { key: "idCotizacion", label: "ID" },
    { key: "nombreProyecto", label: "Proyecto" },
    { key: "nombreUsuario", label: "Cliente" },
    { key: "estado", label: "Estado" },
    {
      key: "fechaReporte",
      label: "Fecha",
      render: (row) =>
        formatDate(isApproved(row.estado) && row.fechaInicio ? row.fechaInicio : row.fechaCreacion),
      exportValue: (row) =>
        toIsoDate(isApproved(row.estado) && row.fechaInicio ? row.fechaInicio : row.fechaCreacion),
    },
    {
      key: "servicios",
      label: "Servicios",
      render: (row) => getCotizacionServicios(row).join(", ") || "-",
      exportValue: (row) => getCotizacionServicios(row).join(", "),
    },
    {
      key: "totalEstimado",
      label: "Total",
      align: "right",
      render: (row) => formatCurrency(row.totalEstimado),
      exportValue: (row) => Number(row.totalEstimado || 0),
    },
  ];

  const visitaColumns = [
    { key: "idSolicitud", label: "ID Solicitud" },
    { key: "fechaVisita", label: "Fecha visita", render: (row) => formatDate(row.fechaVisita), exportValue: (row) => toIsoDate(row.fechaVisita) },
    { key: "horaVisita", label: "Hora" },
    { key: "estado", label: "Estado" },
    { key: "nombreProyecto", label: "Proyecto" },
    { key: "correoUsuario", label: "Cliente" },
    { key: "direccionVisita", label: "Direccion" },
    { key: "celularCliente", label: "Celular" },
  ];

  const cronogramaColumns = [
    { key: "idCronograma", label: "ID Cronograma" },
    { key: "idCotizacion", label: "ID Cotizacion" },
    { key: "nombreProyecto", label: "Proyecto" },
    { key: "nombreCliente", label: "Cliente" },
    { key: "estadoCronograma", label: "Estado" },
    { key: "fechaInicio", label: "Fecha inicio", render: (row) => formatDate(row.fechaInicio), exportValue: (row) => toIsoDate(row.fechaInicio) },
    { key: "fechaFin", label: "Fecha fin", render: (row) => formatDate(row.fechaFin), exportValue: (row) => toIsoDate(row.fechaFin) },
    {
      key: "avanceGeneral",
      label: "Avance",
      align: "right",
      render: (row) => formatPercent(row.avanceGeneral),
      exportValue: (row) => Number(row.avanceGeneral || 0),
    },
    {
      key: "atrasado",
      label: "Atrasado",
      render: (row) => (isLateCronograma(row) ? "Si" : "No"),
      exportValue: (row) => (isLateCronograma(row) ? "Si" : "No"),
    },
  ];

  const avanceColumns = [
    { key: "idAvance", label: "ID Avance" },
    { key: "idCronograma", label: "Cronograma" },
    { key: "nombreProyecto", label: "Proyecto" },
    { key: "nombreCliente", label: "Cliente" },
    { key: "numeroSemana", label: "Semana", align: "right" },
    { key: "fechaRegistro", label: "Fecha registro", render: (row) => formatDate(row.fechaRegistro), exportValue: (row) => toIsoDate(row.fechaRegistro) },
    { key: "titulo", label: "Titulo" },
    { key: "observaciones", label: "Observaciones" },
    { key: "porcentajeSemana", label: "Avance semana", align: "right", render: (row) => formatPercent(row.porcentajeSemana), exportValue: (row) => Number(row.porcentajeSemana || 0) },
    { key: "porcentajeGeneral", label: "Avance general", align: "right", render: (row) => formatPercent(row.porcentajeGeneral), exportValue: (row) => Number(row.porcentajeGeneral || 0) },
    {
      key: "evidencias",
      label: "Evidencias",
      align: "right",
      render: (row) => evidenciasPorAvance[row.idAvance] || 0,
      exportValue: (row) => evidenciasPorAvance[row.idAvance] || 0,
    },
  ];

  const financieroColumns = [
    { key: "servicio", label: "Servicio" },
    { key: "cotizaciones", label: "Cotizaciones aprobadas", align: "right" },
    {
      key: "totalAprobado",
      label: "Total aprobado",
      align: "right",
      render: (row) => formatCurrency(row.totalAprobado),
      exportValue: (row) => Number(row.totalAprobado || 0),
    },
  ];

  if (!puedeVerReportes) {
    return (
      <Box p={3} sx={centeredPageSx}>
        <Title title="Reportes" />
        <Alert severity="warning">No tiene permisos para consultar reportes.</Alert>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 1.5, md: 3 }} sx={centeredPageSx}>
      <Title title="Reportes" />

      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                bgcolor: COLORS.greenSoft,
                color: COLORS.greenDark,
                display: "grid",
                placeItems: "center",
              }}
            >
              <AssessmentIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Reportes
              </Typography>
              <Typography variant="body2" color={COLORS.muted}>
                Administrador y Supervisor
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <FiltersPanel
          filters={filters}
          setFilters={setFilters}
          estadoOptions={estadoOptions}
          servicioOptions={servicioOptions}
          onRefresh={cargarReportes}
          loading={loading}
        />

        {loading && (
          <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CircularProgress size={24} />
              <Typography>Cargando reportes...</Typography>
            </Stack>
            <LinearProgress sx={{ mt: 2 }} />
          </Paper>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && (
          <>
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 2,
                backgroundColor: COLORS.white,
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 1,
                  borderBottom: `1px solid ${COLORS.border}`,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 800,
                  },
                  "& .Mui-selected": {
                    color: COLORS.greenDark,
                  },
                  "& .MuiTabs-indicator": {
                    bgcolor: COLORS.green,
                  },
                }}
              >
                {tabs.map((label) => (
                  <Tab key={label} label={label} />
                ))}
              </Tabs>

              <Box sx={{ p: { xs: 1.5, md: 2 } }}>
                {tab === 0 && (
                  <Stack spacing={2}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6} md={3}>
                        <KpiCard
                          label="Total solicitudes"
                          value={filtered.solicitudes.length}
                          detail={`${filtered.visitas.length} visitas tecnicas`}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <KpiCard
                          label="Total cotizaciones"
                          value={filtered.cotizaciones.length}
                          detail={`${metrics.cotizacionesAprobadas.length} aprobadas`}
                          tone="blue"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <KpiCard
                          label="Total obras activas"
                          value={metrics.obrasActivas.length}
                          detail={`${metrics.obrasAtrasadas.length} atrasadas`}
                          tone={metrics.obrasAtrasadas.length ? "red" : "green"}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <KpiCard
                          label="Total avances registrados"
                          value={filtered.avances.length}
                          detail={`${sumBy(filtered.avances, (avance) => evidenciasPorAvance[avance.idAvance])} evidencias`}
                          tone="amber"
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <StatusSummary
                          title="Solicitudes por estado"
                          data={countBy(filtered.solicitudes, (item) => item.estado)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <StatusSummary
                          title="Cotizaciones por estado"
                          data={countBy(filtered.cotizaciones, (item) => item.estado)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <StatusSummary
                          title="Cronogramas"
                          data={{
                            "En proceso": metrics.obrasActivas.length,
                            Atrasadas: metrics.obrasAtrasadas.length,
                            Finalizadas: filtered.cronogramas.filter((item) =>
                              isFinished(item.estadoCronograma)
                            ).length,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                )}

                {tab === 1 && (
                  <ReportTable
                    title="Reporte de solicitudes"
                    exportName="reporte_solicitudes"
                    columns={solicitudColumns}
                    rows={filtered.solicitudes}
                    getRowKey={(row) => row.idSolicitud}
                  />
                )}

                {tab === 2 && (
                  <ReportTable
                    title="Reporte de cotizaciones"
                    exportName="reporte_cotizaciones"
                    columns={cotizacionColumns}
                    rows={filtered.cotizaciones}
                    getRowKey={(row) => row.idCotizacion}
                  />
                )}

                {tab === 3 && (
                  <ReportTable
                    title="Reporte de visitas tecnicas"
                    exportName="reporte_visitas_tecnicas"
                    columns={visitaColumns}
                    rows={filtered.visitas}
                    getRowKey={(row) => row.idSolicitud}
                  />
                )}

                {tab === 4 && (
                  <ReportTable
                    title="Reporte de cronogramas"
                    exportName="reporte_cronogramas"
                    columns={cronogramaColumns}
                    rows={filtered.cronogramas}
                    getRowKey={(row) => row.idCronograma}
                  />
                )}

                {tab === 5 && (
                  <ReportTable
                    title="Reporte de avances"
                    exportName="reporte_avances"
                    columns={avanceColumns}
                    rows={filtered.avances}
                    getRowKey={(row) => row.idAvance}
                  />
                )}

                {tab === 6 && (
                  <Stack spacing={2}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={4}>
                        <KpiCard
                          label="Total cotizado"
                          value={formatCurrency(metrics.totalCotizado)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <KpiCard
                          label="Total aprobado"
                          value={formatCurrency(metrics.totalAprobado)}
                          tone="blue"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <KpiCard
                          label="Servicios rentables"
                          value={financieroPorServicio.length}
                          detail={
                            financieroPorServicio[0]?.servicio ||
                            "Sin servicio destacado"
                          }
                          tone="amber"
                        />
                      </Grid>
                    </Grid>
                    <ReportTable
                      title="Reporte financiero"
                      exportName="reporte_financiero"
                      columns={financieroColumns}
                      rows={financieroPorServicio}
                      getRowKey={(row) => row.servicio}
                    />
                  </Stack>
                )}
              </Box>
            </Paper>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default Reportes;

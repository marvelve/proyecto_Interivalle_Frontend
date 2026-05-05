import { Box, Card, CardContent, Chip, CircularProgress, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useListContext } from "react-admin";

const formatDate = (value) => {
  if (!value) return "-";

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const estadoColor = (estado) => {
  switch (String(estado || "").toUpperCase()) {
    case "APROBADA":
    case "GENERADA":
    case "CONFIRMADA":
    case "COMPLETADA":
    case "TERMINADA":
      return {
        bg: "#E8F5E9",
        text: "#2E7D32",
      };
    case "EN_PROCESO":
      return {
        bg: "#FFF3E0",
        text: "#EF6C00",
      };
    case "PENDIENTE":
      return {
        bg: "#FFF8E1",
        text: "#F57F17",
      };
    default:
      return {
        bg: "#F5F5F5",
        text: "#616161",
      };
  }
};

export const ClienteProyectoCards = ({
  records,
  loading,
  emptyText = "No hay proyectos para mostrar.",
  getProyecto,
  getEstado,
  getFecha,
  getFechaLabel = () => "Fecha",
  getDetalle,
  onOpen,
}) => {
  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={2} p={3}>
        <CircularProgress size={24} />
        <Typography>Cargando proyectos...</Typography>
      </Box>
    );
  }

  if (!records?.length) {
    return (
      <Typography color="text.secondary" p={3}>
        {emptyText}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1180,
        mx: "auto",
        py: 2,
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        gap: 2.5,
      }}
    >
      {records.map((record) => {
        const estado = getEstado(record);
        const color = estadoColor(estado);
        const detalle = getDetalle?.(record);

        return (
          <Card
            key={record.id || record.idCotizacion || record.idCronograma}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(record)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen(record);
              }
            }}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              border: "1px solid #C8E6C9",
              boxShadow: "0 8px 22px rgba(46, 125, 50, 0.12)",
              transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 14px 28px rgba(46, 125, 50, 0.18)",
                borderColor: "#2E7D32",
              },
              "&:focus-visible": {
                outline: "3px solid rgba(46, 125, 50, 0.25)",
                outlineOffset: 2,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
                <Box minWidth={0}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Proyecto
                  </Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                    {getProyecto(record) || "-"}
                  </Typography>
                </Box>

                <ArrowForwardIcon sx={{ color: "#2E7D32", mt: 0.5 }} />
              </Box>

              <Box mt={2} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                <Typography variant="body2" color="text.secondary" fontWeight={700}>
                  Estado
                </Typography>
                <Chip
                  label={estado || "-"}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    bgcolor: color.bg,
                    color: color.text,
                  }}
                />
              </Box>

              <Box mt={1.4} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                <Typography variant="body2" color="text.secondary" fontWeight={700}>
                  {getFechaLabel(record)}
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {formatDate(getFecha(record))}
                </Typography>
              </Box>

              {detalle && (
                <Typography variant="body2" color="text.secondary" mt={1.4}>
                  {detalle}
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export const ClienteProyectoCardsFromList = (props) => {
  const { data, isLoading, isPending } = useListContext();
  const records = Array.isArray(data) ? data : Object.values(data || {});

  return (
    <ClienteProyectoCards
      {...props}
      records={records}
      loading={isLoading || isPending}
    />
  );
};


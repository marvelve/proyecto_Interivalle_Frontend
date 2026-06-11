import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DownloadIcon from "@mui/icons-material/Download";

import { useNotify } from "react-admin";
import { useNavigate, useParams } from "react-router-dom";
import httpClient, { apiUrl } from "../../app/httpClient";

const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(valor));
};

const formatearNumero = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "-";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(valor));
};

const toNumber = (valor) => Number(valor || 0);

const tienePrecioMaterialCero = (precio) => {
  if (precio === null || precio === undefined || precio === "") {
    return false;
  }

  return Number(precio) === 0;
};

const avisoMaterialesPropietarioTexto =
  "LAS FILAS RESALTADAS EN AMARILLO CON VALOR CERO LAS PROVEE EL PROPIETARIO, DEBIDO A QUE ESTOS MATERIALES SON DEL GUSTO DEL CLIENTE";

const formatearAreaPrivada = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "-";
  return `${formatearNumero(valor)} m²`;
};

const formatearFecha = (valor) => {
  if (!valor) return "-";
  const fecha = valor.toString().substring(0, 10);
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const crearFechaLocal = (valor) => {
  if (!valor) return new Date();
  const [year, month, day] = valor.toString().substring(0, 10).split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const claveFechaLocal = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const diasSemanaCalendario = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

const obtenerNombreServicio = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item.trim();

  return (
    item.nombreServicio ||
    item.servicio ||
    item.nombre ||
    item?.servicios?.nombreServicio ||
    item?.servicio?.nombreServicio ||
    ""
  )
    .toString()
    .trim();
};

const obtenerServiciosSeleccionados = (cotizacion, detalles = []) => {
  const origenServicios =
    cotizacion?.serviciosSeleccionados ||
    cotizacion?.solicitudServicios ||
    cotizacion?.servicios ||
    cotizacion?.solicitud?.serviciosSeleccionados ||
    [];

  const serviciosDirectos = Array.isArray(origenServicios)
    ? origenServicios.map(obtenerNombreServicio)
    : [obtenerNombreServicio(origenServicios)];

  const serviciosDetalle = detalles.map((item) =>
    obtenerNombreServicio({
      nombreServicio: item?.nombreServicio || item?.servicio,
    })
  );

  return [...new Set([...serviciosDirectos, ...serviciosDetalle])]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
};

const obtenerMedidaAreaPrivada = (cotizacion) =>
  cotizacion?.medidaAreaPrivada ??
  cotizacion?.areaPrivada ??
  cotizacion?.manoObra?.medidaAreaPrivada ??
  cotizacion?.cotizacionManoObra?.medidaAreaPrivada ??
  null;

const filtroSelectSx = {
  minWidth: 260,
  "& .MuiOutlinedInput-root": {
    minHeight: 45,
    borderRadius: "10px",
    backgroundColor: "#2e7d32",
    color: "#ffffff",
    fontWeight: 700,
    "& fieldset": {
      borderColor: "#2e7d32",
    },
    "&:hover fieldset": {
      borderColor: "#1b5e20",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1b5e20",
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": {
    color: "#ffffff",
    fontWeight: 700,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ffffff",
  },
  "& .MuiSelect-icon": {
    color: "#ffffff",
  },
};

const estilos = {
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    border: "1px solid #ccc",
    padding: "10px",
    background: "#f3f3f3",
    textAlign: "center",
    fontWeight: "bold",
  },
  td: {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "left",
    verticalAlign: "top",
  },
  tdMaterialPrecioCero: {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "left",
    verticalAlign: "top",
    background: "#fff59d",
  },
  avisoMaterialesPropietario: {
    background: "#fff59d",
    border: "1px solid #e6d94c",
    borderRadius: "4px",
    color: "#111",
    fontSize: "13px",
    fontWeight: "bold",
    lineHeight: 1.4,
    padding: "8px 12px",
    textTransform: "uppercase",
  },
  resumenCard: {
    padding: "16px",
    borderRadius: "10px",
    background: "#f8f9fb",
    border: "1px solid #ddd",
    textAlign: "center",
    minHeight: "100px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  resumenCardTotalGeneral: {
    padding: "16px",
    borderRadius: "10px",
    background: "#bbf7d0",
    border: "1px solid #0a8f08",
    textAlign: "center",
    minHeight: "100px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    "& .MuiTypography-root": {
      fontWeight: "bold",
    },
  },
  tdSemana: {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "center",
    verticalAlign: "middle",
    fontWeight: "bold",
    background: "#f8f9fb",
  },
  tdActividad: {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "center",
    verticalAlign: "middle",
    fontWeight: "bold",
    background: "#fcfcfc",
  },
};

const normalizarTexto = (texto) => {
  return (texto || "").toString().trim().toLowerCase();
};

const normalizarTextoComparacion = (texto) =>
  (texto || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();

const palabrasServicioEspecializado = [
  "CARPINTERIA",
  "CARPINTER",
  "VIDRIO",
  "MESON",
  "MARMOL",
  "GRANITO",
];

const detallesBase = (cotizacion) =>
  cotizacion?.detalleBase || cotizacion?.detalles || [];

const textoDetalleProducto = (item) => {
  return [
    item?.categoria,
    item?.servicio,
    item?.nombreServicio,
    item?.descripcion,
    item?.actividadMaterial,
  ]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
};

const esDetalleServicioProducto = (item, idsServicio, palabrasClave) => {
  const tipoItem = (item?.tipoItem || "").toUpperCase();
  const servicioId = Number(item?.servicioId || item?.idServicio || item?.id_servicio);
  const texto = textoDetalleProducto(item);

  return (
    tipoItem === "PRODUCTO" &&
    (idsServicio.includes(servicioId) ||
      palabrasClave.some((palabra) => texto.includes(palabra)))
  );
};

const esDetalleCarpinteria = (item) =>
  esDetalleServicioProducto(item, [2], ["CARPINTERIA", "CARPINTER"]);

const esDetalleVidrio = (item) =>
  esDetalleServicioProducto(item, [3], ["VIDRIO"]);

const esDetalleMezon = (item) =>
  esDetalleServicioProducto(item, [4], ["MESON", "MARMOL", "GRANITO"]);

const obtenerClaveProductoEspecializado = (item) =>
  normalizarTextoComparacion(
    item?.descripcion || item?.actividadMaterial || item?.actividad || ""
  );

const obtenerTextoActividadBase = (actividad) => {
  const materiales = (actividad?.materiales || [])
    .map((material) => material?.material)
    .filter(Boolean)
    .join(" ");

  return normalizarTextoComparacion(`${actividad?.actividad || ""} ${materiales}`);
};

const esActividadServicioEspecializado = (
  actividad,
  productosEspecializados
) => {
  const textoActividad = obtenerTextoActividadBase(actividad);

  if (!textoActividad) return false;

  if (palabrasServicioEspecializado.some((palabra) => textoActividad.includes(palabra))) {
    return true;
  }

  return [...productosEspecializados].some(
    (producto) =>
      producto &&
      (textoActividad === producto ||
        textoActividad.includes(producto) ||
        producto.includes(textoActividad))
  );
};

const calcularTotalesSemanaBase = (actividades = []) => {
  return actividades.reduce(
    (totales, actividad) => {
      const totalActividad = toNumber(actividad?.precioActividad);
      const totalMateriales = (actividad?.materiales || []).reduce(
        (acc, material) => acc + toNumber(material?.precioMaterial),
        0
      );

      return {
        totalManoObra: totales.totalManoObra + totalActividad,
        totalMateriales: totales.totalMateriales + totalMateriales,
        totalSemana: totales.totalSemana + totalActividad,
      };
    },
    {
      totalManoObra: 0,
      totalMateriales: 0,
      totalSemana: 0,
    }
  );
};

const recalcularSemanaBase = (semanaObj, actividades) => {
  const totales = calcularTotalesSemanaBase(actividades);

  return {
    ...semanaObj,
    actividades,
    totalManoObra: totales.totalManoObra,
    totalMateriales: totales.totalMateriales,
    totalProductos: 0,
    totalSemana: totales.totalSemana,
  };
};

const formatearCantidadUnidad = (item) => {
  const cantidad = toNumber(item?.cantidad);
  const unidad = (item?.unidad || "").toUpperCase();

  if (unidad === "MT") {
    return `${cantidad.toFixed(2)} MT`;
  }

  return Number.isInteger(cantidad) ? `${cantidad}` : cantidad.toFixed(2);
};

const obtenerNombreProductoDetalle = (item) =>
  item?.actividadMaterial || item?.nombreProducto || item?.descripcion || "-";

const TablaDetalleProductos = ({ titulo, detalles, total, etiquetaTotal }) => (
  <>
    <Typography variant="h5" fontWeight="bold" mt={5} mb={2}>
      {titulo}
    </Typography>

    <Box sx={{ overflowX: "auto" }}>
      <table style={estilos.tabla}>
        <thead>
          <tr>
            <th style={estilos.th}>Cantidad / MT</th>
            <th style={estilos.th}>Producto</th>
            <th style={estilos.th}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((item, index) => (
            <tr key={item.idDetalle || index}>
              <td style={estilos.td}>{formatearCantidadUnidad(item)}</td>
              <td style={estilos.td}>
                {obtenerNombreProductoDetalle(item)}
              </td>
              <td style={estilos.td}>{formatearMoneda(item.subtotalVenta)}</td>
            </tr>
          ))}

          <tr>
            <td style={{ ...estilos.td, fontWeight: "bold" }} colSpan={2}>
              {etiquetaTotal}
            </td>
            <td style={{ ...estilos.td, fontWeight: "bold" }}>
              {formatearMoneda(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </Box>
  </>
);

const escapeHtml = (valor) =>
  (valor ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderCeldaPdf = (valor, extra = "") =>
  `<td ${extra}>${escapeHtml(valor)}</td>`;

const renderTablaBasePdf = (filas) => {
  const filasHtml =
    filas.length > 0
      ? filas
          .map((fila) => {
            const celdas = [];
            const claseMaterialPrecioCero = tienePrecioMaterialCero(fila.precioMaterial)
              ? ' class="material-owner-cell"'
              : "";

            if (fila.mostrarSemana) {
              celdas.push(
                renderCeldaPdf(`Semana ${fila.semana}`, `rowspan="${fila.rowSpanSemana}" class="center strong"`)
              );
              celdas.push(
                renderCeldaPdf(formatearMoneda(fila.totalSemana), `rowspan="${fila.rowSpanSemana}" class="center strong"`)
              );
            }

            if (fila.mostrarActividad) {
              celdas.push(
                renderCeldaPdf(fila.actividad, `rowspan="${fila.rowSpanActividad}" class="center strong"`)
              );
              celdas.push(
                renderCeldaPdf(formatearMoneda(fila.precioActividad), `rowspan="${fila.rowSpanActividad}" class="center strong"`)
              );
            }

            celdas.push(
              renderCeldaPdf(
                fila.cantidad !== "" ? formatearNumero(fila.cantidad) : "-",
                claseMaterialPrecioCero
              )
            );
            celdas.push(renderCeldaPdf(fila.material || "-", claseMaterialPrecioCero));
            celdas.push(
              renderCeldaPdf(
                fila.precioMaterial !== null
                  ? formatearMoneda(fila.precioMaterial)
                  : "-",
                claseMaterialPrecioCero
              )
            );

            return `<tr>${celdas.join("")}</tr>`;
          })
          .join("")
      : `<tr><td colspan="7">No hay actividades de Obra Blanca registradas.</td></tr>`;

  return `
    <section>
      <div class="section-title-row">
        <h2>Detalle de la cotización base</h2>
        <div class="material-owner-note">${escapeHtml(avisoMaterialesPropietarioTexto)}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Semana</th>
            <th>Valor MANO OBRA semana</th>
            <th>Actividad</th>
            <th>Valor actividad</th>
            <th>Cantidad</th>
            <th>Material</th>
            <th>Precio material</th>
          </tr>
        </thead>
        <tbody>${filasHtml}</tbody>
      </table>
    </section>
  `;
};

const renderTablaProductosPdf = (titulo, detalles, total, etiquetaTotal) => {
  if (!detalles.length) return "";

  const filas = detalles
    .map(
      (item) => `
        <tr>
          ${renderCeldaPdf(formatearCantidadUnidad(item))}
          ${renderCeldaPdf(obtenerNombreProductoDetalle(item))}
          ${renderCeldaPdf(formatearMoneda(item.subtotalVenta))}
        </tr>
      `
    )
    .join("");

  return `
    <section>
      <h2>${escapeHtml(titulo)}</h2>
      <table>
        <thead>
          <tr>
            <th>Cantidad / MT</th>
            <th>Producto</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${filas}
          <tr class="total-row">
            <td colspan="2">${escapeHtml(etiquetaTotal)}</td>
            <td>${escapeHtml(formatearMoneda(total))}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
};

const renderTablaAdicionalesPdf = (titulo, columnas, filas, etiquetaVacia) => {
  if (!filas.length) return "";

  return `
    <section>
      <h3>${escapeHtml(titulo)}</h3>
      <table>
        <thead>
          <tr>${columnas.map((columna) => `<th>${escapeHtml(columna.titulo)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${
            filas.length > 0
              ? filas
                  .map(
                    (fila) => `
                      <tr>
                        ${columnas
                          .map((columna) => renderCeldaPdf(columna.valor(fila)))
                          .join("")}
                      </tr>
                    `
                  )
                  .join("")
              : `<tr><td colspan="${columnas.length}">${escapeHtml(etiquetaVacia)}</td></tr>`
          }
        </tbody>
      </table>
    </section>
  `;
};

const construirHtmlCotizacionPdf = ({
  cotizacion,
  medidaAreaPrivada,
  serviciosSeleccionados,
  filasBase,
  detallesCarpinteria,
  detallesVidrio,
  detallesMezon,
  adicionalesObraBlanca,
  adicionalesCarpinteria,
  adicionalesVidrio,
  adicionalesMeson,
  totales,
}) => {
  const servicios = serviciosSeleccionados.length > 0
    ? serviciosSeleccionados.join(", ")
    : "-";

  const hayAdicionales =
    adicionalesObraBlanca.length > 0 ||
    adicionalesCarpinteria.length > 0 ||
    adicionalesVidrio.length > 0 ||
    adicionalesMeson.length > 0;

  const resumen = [
    ["Total Obra Blanca", totales.totalManoObra],
    ["Total Materiales", totales.totalMateriales],
    ["Total Carpintería", totales.totalCarpinteria],
    ["Total Divisiones en Vidrio", totales.totalVidrio],
    ["Total Mesones Mármol", totales.totalMezon],
    ["Total Base", totales.totalBase],
    ["Total Adicionales", totales.totalAdicionales],
    ["Total General", totales.totalGeneral],
  ];

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Cotización ${escapeHtml(cotizacion.idCotizacion)}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            color: #111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            margin: 0;
          }
          h1 { font-size: 28px; margin: 0 0 12px; }
          h2 { font-size: 18px; margin: 24px 0 10px; }
          h3 { font-size: 15px; margin: 18px 0 8px; }
          p { margin: 4px 0; }
          section { break-inside: avoid; page-break-inside: avoid; }
          table {
            border-collapse: collapse;
            margin-top: 8px;
            width: 100%;
          }
          th, td {
            border: 1px solid #cfcfcf;
            padding: 7px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #f3f3f3;
            font-weight: 700;
            text-align: center;
          }
          .material-owner-cell {
            background: #fff59d !important;
          }
          .material-owner-note {
            background: #fff59d !important;
            border: 1px solid #e6d94c;
            border-radius: 4px;
            color: #111;
            flex: 1;
            font-size: 11px;
            font-weight: 700;
            line-height: 1.35;
            padding: 7px 10px;
            text-transform: uppercase;
          }
          .section-title-row {
            align-items: center;
            display: flex;
            gap: 14px;
            margin: 24px 0 10px;
          }
          .section-title-row h2 {
            margin: 0;
            white-space: nowrap;
          }
          .center { text-align: center; vertical-align: middle; }
          .strong { font-weight: 700; }
          .meta {
            display: grid;
            gap: 6px 20px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-bottom: 18px;
          }
          .meta-full { grid-column: 1 / -1; }
          .summary {
            display: grid;
            gap: 10px;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            margin: 18px 0 22px;
          }
          .summary-card {
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
          }
          .summary-card-total-general {
            background: #bbf7d0 !important;
            border: 1px solid #0a8f08 !important;
            font-weight: 700;
          }
          .summary-card-total-general .summary-label,
          .summary-card-total-general .summary-value {
            font-weight: 700;
          }
          .summary-label { font-size: 11px; margin-bottom: 6px; }
          .summary-value { font-size: 15px; font-weight: 700; }
          .total-row td { font-weight: 700; }
          .final-summary {
            margin-top: 24px;
            max-width: 420px;
          }
          .final-summary td:first-child { font-weight: 700; width: 55%; }
          @media print {
            * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <h1>Cotización #${escapeHtml(cotizacion.idCotizacion)}</h1>
        <div class="meta">
          <p><strong>Proyecto:</strong> ${escapeHtml(cotizacion.nombreProyecto || "-")}</p>
          <p><strong>Área privada:</strong> ${escapeHtml(formatearAreaPrivada(medidaAreaPrivada))}</p>
          <p><strong>Estado:</strong> ${escapeHtml(cotizacion.estado || "-")}</p>
          <p class="meta-full"><strong>Servicios seleccionados:</strong> ${escapeHtml(servicios)}</p>
        </div>

        <div class="summary">
          ${resumen
            .map(
              ([label, value]) => `
                <div class="summary-card${label === "Total General" ? " summary-card-total-general" : ""}">
                  <div class="summary-label">${escapeHtml(label)}</div>
                  <div class="summary-value">${escapeHtml(formatearMoneda(value))}</div>
                </div>
              `
            )
            .join("")}
        </div>

        ${renderTablaBasePdf(filasBase)}
        ${renderTablaProductosPdf("Detalle Carpintería", detallesCarpinteria, totales.totalCarpinteria, "Total Carpintería")}
        ${renderTablaProductosPdf("Detalle Divisiones en Vidrio", detallesVidrio, totales.totalVidrio, "Total Divisiones en Vidrio")}
        ${renderTablaProductosPdf("Detalle Mesones en Mármol", detallesMezon, totales.totalMezon, "Total Mesones en Mármol")}

        <section>
          <h2>Actividades adicionales</h2>
          ${
            hayAdicionales
              ? `
                ${renderTablaAdicionalesPdf("Mano de Obra / Obra Blanca", [
                  { titulo: "Actividad", valor: (item) => item.actividad || "-" },
                  { titulo: "Lugar", valor: (item) => item.lugar || "-" },
                  { titulo: "Unidad", valor: (item) => item.unidad || "-" },
                  { titulo: "Cantidad", valor: (item) => item.cantidad ?? "-" },
                  { titulo: "Medida", valor: (item) => formatearNumero(item.medida) },
                  { titulo: "Precio Unitario", valor: (item) => formatearMoneda(item.precioUnitario) },
                  { titulo: "Subtotal", valor: (item) => formatearMoneda(item.subtotal) },
                ], adicionalesObraBlanca, "No hay actividades adicionales de Obra Blanca.")}
                ${renderTablaAdicionalesPdf("Carpintería adicional", [
                  { titulo: "Tipo mueble", valor: (item) => item.tipoMueble || "-" },
                  { titulo: "Material / Lugar", valor: (item) => item.material || "-" },
                  { titulo: "Cantidad", valor: (item) => item.cantidad ?? "-" },
                  { titulo: "Largo", valor: (item) => formatearNumero(item.largo) },
                  { titulo: "Ancho", valor: (item) => formatearNumero(item.ancho) },
                  { titulo: "Alto", valor: (item) => formatearNumero(item.alto) },
                  { titulo: "Precio Unitario", valor: (item) => formatearMoneda(item.precioUnitario) },
                  { titulo: "Subtotal", valor: (item) => formatearMoneda(item.subtotal) },
                ], adicionalesCarpinteria, "No hay carpintería adicional.")}
                ${renderTablaAdicionalesPdf("Vidrio adicional", [
                  { titulo: "Tipo vidrio", valor: (item) => item.tipoVidrio || "-" },
                  { titulo: "Cantidad", valor: (item) => item.cantidad ?? "-" },
                  { titulo: "Precio Unitario", valor: (item) => formatearMoneda(item.precioUnitario) },
                  { titulo: "Subtotal", valor: (item) => formatearMoneda(item.subtotal) },
                ], adicionalesVidrio, "No hay vidrio adicional.")}
                ${renderTablaAdicionalesPdf("Mesón granito adicional", [
                  { titulo: "Tipo granito", valor: (item) => item.tipoGranito || "-" },
                  { titulo: "Cantidad", valor: (item) => item.cantidad ?? "-" },
                  { titulo: "Precio Unitario", valor: (item) => formatearMoneda(item.precioUnitario) },
                  { titulo: "Subtotal", valor: (item) => formatearMoneda(item.subtotal) },
                ], adicionalesMeson, "No hay mesón granito adicional.")}
              `
              : "<p>No hay actividades adicionales registradas.</p>"
          }
        </section>

        <section>
          <h2>Resumen final</h2>
          <table class="final-summary">
            <tbody>
              <tr><td>Total mano de obra</td><td>${escapeHtml(formatearMoneda(totales.totalManoObra))}</td></tr>
              <tr><td>Total materiales</td><td>${escapeHtml(formatearMoneda(totales.totalMateriales))}</td></tr>
              <tr><td>Total carpintería</td><td>${escapeHtml(formatearMoneda(totales.totalCarpinteria))}</td></tr>
              <tr><td>Total divisiones en vidrio</td><td>${escapeHtml(formatearMoneda(totales.totalVidrio))}</td></tr>
              <tr><td>Total mesones mármol</td><td>${escapeHtml(formatearMoneda(totales.totalMezon))}</td></tr>
              <tr><td>Total cotización base</td><td>${escapeHtml(formatearMoneda(totales.totalBase))}</td></tr>
              <tr><td>Total adicionales</td><td>${escapeHtml(formatearMoneda(totales.totalAdicionales))}</td></tr>
              <tr class="total-row"><td>Total general</td><td>${escapeHtml(formatearMoneda(totales.totalGeneral))}</td></tr>
            </tbody>
          </table>
        </section>
      </body>
    </html>
  `;
};

const construirFilasConRowSpan = (semanas = []) => {
  const filas = [];

  semanas.forEach((semanaObj) => {
    const actividades = semanaObj?.actividades || [];

    const totalFilasSemana =
      actividades.length > 0
        ? actividades.reduce((acc, act) => {
            const materiales =
              act?.materiales?.length > 0 ? act.materiales.length : 1;
            return acc + materiales;
          }, 0)
        : 1;

    let semanaPintada = false;

    if (actividades.length === 0) {
      filas.push({
        mostrarSemana: true,
        rowSpanSemana: 1,
        semana: semanaObj?.semana,
        totalSemana: semanaObj?.totalSemana,

        mostrarActividad: true,
        rowSpanActividad: 1,
        actividad: "-",
        precioActividad: null,

        cantidad: "",
        material: "",
        precioMaterial: null,
      });

      return;
    }

    actividades.forEach((act) => {
      const materiales = act?.materiales?.length > 0 ? act.materiales : [null];
      const rowSpanActividad = materiales.length;

      materiales.forEach((mat, indexMaterial) => {
        filas.push({
          mostrarSemana: !semanaPintada,
          rowSpanSemana: !semanaPintada ? totalFilasSemana : 0,
          semana: semanaObj?.semana,
          totalSemana: semanaObj?.totalSemana,

          mostrarActividad: indexMaterial === 0,
          rowSpanActividad: indexMaterial === 0 ? rowSpanActividad : 0,
          actividad: act?.actividad || "-",
          precioActividad: act?.precioActividad ?? null,

          cantidad: mat?.cantidad ?? "",
          material: mat?.material ?? "",
          precioMaterial: mat?.precioMaterial ?? null,
        });

        if (!semanaPintada) {
          semanaPintada = true;
        }
      });
    });
  });

  return filas;
};

const CotizacionVista = () => {
  const navigate = useNavigate();
  const { idCotizacion } = useParams();

  const [loading, setLoading] = useState(true);
  const [cotizacion, setCotizacion] = useState(null);

  const [filtroSemana, setFiltroSemana] = useState("");
  const [filtroActividad, setFiltroActividad] = useState("");

  const [openAprobar, setOpenAprobar] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [aprobando, setAprobando] = useState(false);
  const [aprobandoInterivalle, setAprobandoInterivalle] = useState(false);
  const [cronogramaCotizacion, setCronogramaCotizacion] = useState(null);
  const [consultandoCronograma, setConsultandoCronograma] = useState(false);
  const [fechasInicioDisponibles, setFechasInicioDisponibles] = useState([]);
  const [cargandoFechasInicio, setCargandoFechasInicio] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });
  const notify = useNotify();

  const idRol = Number(localStorage.getItem("idRol"));
  const esCliente = idRol === 3;
  const esAdminSupervisor = idRol === 1 || idRol === 2;
  const puedeGestionarCotizacion = idRol === 1 || idRol === 2 || idRol === 3;

  useEffect(() => {
    cargarCotizacion();
  }, [idCotizacion]);

  useEffect(() => {
    if (normalizarTexto(cotizacion?.estado) === "aprobada") {
      cargarCronogramaCotizacion();
    } else {
      setCronogramaCotizacion(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cotizacion?.estado, idCotizacion]);

  useEffect(() => {
    if (openAprobar) {
      cargarFechasInicioDisponibles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAprobar]);

  const cargarCotizacion = async () => {
    setLoading(true);

    try {
      const urlVistaCompleta = esCliente
        ? `${apiUrl}/api/cliente/cotizaciones/${idCotizacion}/vista-completa`
        : `${apiUrl}/api/cotizaciones/${idCotizacion}/vista-completa`;

      const { json } = await httpClient(urlVistaCompleta);

      setCotizacion({
        ...json,
        detalleBase: json.detalleBase || json.detalles || [],
        semanas: json.semanas || [],
        totalManoObra: json.totalManoObra ?? 0,
        totalMateriales: json.totalMateriales ?? 0,
        totalProductos: json.totalProductos ?? 0,
        medidaAreaPrivada: json.medidaAreaPrivada ?? null,
        serviciosSeleccionados:
          json.serviciosSeleccionados || json.solicitudServicios || [],
        cronogramaGenerado: Boolean(json.cronogramaGenerado),
        idCronograma: json.idCronograma ?? null,
        totalEstimado: json.totalEstimado ?? 0,
        totalEstimadoBase:
          json.totalEstimadoBase ??
          (Number(json.totalManoObra || 0) +
            Number(json.totalMateriales || 0) +
            Number(json.totalProductos || 0)),
        totalAdicionales: json.totalAdicionales ?? 0,
        totalGeneral:
          json.totalGeneral ??
          json.totalEstimado ??
          (Number(json.totalManoObra || 0) +
            Number(json.totalMateriales || 0) +
            Number(json.totalProductos || 0) +
            Number(json.totalAdicionales || 0)),
      });
    } catch (error) {
      const mensaje = error?.body?.message || error?.message || "";
      const noHayPersonalizada = mensaje.includes(
        "No existe cotización personalizada"
      );

      if (!noHayPersonalizada) {
        alert(mensaje || "No se pudo cargar la cotización");
        setLoading(false);
        return;
      }

      try {
        const urlBase = esCliente
          ? `${apiUrl}/api/cliente/cotizaciones/${idCotizacion}`
          : `${apiUrl}/api/cotizaciones/${idCotizacion}`;

        const { json } = await httpClient(urlBase);

        const totalBase =
          Number(json.totalManoObra || 0) +
          Number(json.totalMateriales || 0) +
          Number(json.totalProductos || 0);

        setCotizacion({
          idCotizacion: json.idCotizacion,
          nombreProyecto: json.nombreProyecto,
          estado: json.estado,
          totalManoObra: json.totalManoObra ?? 0,
          totalMateriales: json.totalMateriales ?? 0,
          totalProductos: json.totalProductos ?? 0,
          medidaAreaPrivada: json.medidaAreaPrivada ?? null,
          serviciosSeleccionados:
            json.serviciosSeleccionados || json.solicitudServicios || [],
          cronogramaGenerado: Boolean(json.cronogramaGenerado),
          idCronograma: json.idCronograma ?? null,
          totalEstimado: json.totalEstimado ?? totalBase,
          totalEstimadoBase: totalBase,
          totalAdicionales: 0,
          totalGeneral: json.totalGeneral ?? json.totalEstimado ?? totalBase,
          detalleBase: json.detalles || [],
          semanas: json.semanas || [],
          personalizada: null,
        });
      } catch (errorBase) {
        console.error("Error cargando cotización base:", errorBase);
        alert(
          errorBase?.body?.message ||
            errorBase?.message ||
            "No se pudo cargar la cotización"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarCronogramaCotizacion = async (mostrarError = false) => {
    try {
      setConsultandoCronograma(true);

      const { json } = await httpClient(
        `${apiUrl}/api/cliente/cronogramas/cotizacion/${idCotizacion}`
      );

      setCronogramaCotizacion(json);
      return json;
    } catch (error) {
      if (mostrarError) {
        console.error("Error cargando cronograma de cotizacion:", error);
      }
      setCronogramaCotizacion(null);

      if (mostrarError) {
        notify(
          error?.body?.message ||
            error?.message ||
            "No se pudo cargar el cronograma de la cotizacion",
          { type: "error" }
        );
      }

      return null;
    } finally {
      setConsultandoCronograma(false);
    }
  };

  const cargarFechasInicioDisponibles = async () => {
    try {
      setCargandoFechasInicio(true);
      setFechaInicio("");

      const { json } = await httpClient(
        `${apiUrl}/api/cliente/cronogramas/fechas-inicio-disponibles?dias=365`
      );

      const fechas = Array.isArray(json) ? json : [];
      setFechasInicioDisponibles(fechas);

      if (fechas.length > 0) {
        const primeraFecha = crearFechaLocal(fechas[0].fechaInicio);
        setMesCalendario(
          new Date(primeraFecha.getFullYear(), primeraFecha.getMonth(), 1)
        );
      }
    } catch (error) {
      console.error("Error cargando fechas de inicio disponibles:", error);
      setFechasInicioDisponibles([]);
      notify(
        error?.body?.message ||
          error?.message ||
          "No se pudieron cargar las fechas disponibles",
        { type: "error" }
      );
    } finally {
      setCargandoFechasInicio(false);
    }
  };

  const handleAprobar = async () => {
    try {
      if (!puedeGestionarCotizacion) {
        notify("No tienes permisos para aprobar la cotización", {
          type: "warning",
        });
        return;
      }

      if (!fechaInicio) {
        notify("Debes seleccionar la fecha de inicio", { type: "warning" });
        return;
      }

      const fechaDisponible = fechasInicioDisponibles.some(
        (item) => item?.fechaInicio === fechaInicio
      );

      if (!fechaDisponible) {
        notify("Selecciona una fecha de inicio disponible", { type: "warning" });
        return;
      }

      setAprobando(true);

      const token = localStorage.getItem("token");

      await fetch(`${apiUrl}/api/cliente/cotizaciones/${idCotizacion}/aprobar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mensaje: esCliente
            ? "Aprobada por el cliente"
            : "Aprobada por usuario interno",
          fechaInicio: fechaInicio,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "No se pudo aprobar la cotización");
        }
        return res.json();
      });

        notify(
          esCliente
          ? "Cotización aprobada. El cronograma queda pendiente de aprobación por InterValle."
          : "Cotización aprobada. Cronograma pendiente de aprobación InterValle.",
          { type: "success" }
        );
      setOpenAprobar(false);
      await cargarCotizacion();
      await cargarCronogramaCotizacion(false);
      navigate(`/cronogramas/cotizacion/${idCotizacion}`);
    } catch (error) {
      console.error(error);
      notify(error.message || "Error al aprobar la cotización", {
        type: "error",
      });
    } finally {
      setAprobando(false);
    }
  };

  const handleDevolverARevision = async () => {
    if (!esAdminSupervisor) {
      notify("No tienes permisos para devolver la cotización a revisión", {
        type: "warning",
      });
      return;
    }

    try {
      setAprobandoInterivalle(true);
      const token = localStorage.getItem("token");
      const opcionesRequest = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(
        `${apiUrl}/api/cotizaciones/${idCotizacion}/devolver-revision`,
        opcionesRequest
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo devolver la cotización a revisión");
      }

      notify("Cotización devuelta a revisión. El cliente debe revisarla y aprobarla nuevamente.", {
        type: "success",
      });
      await cargarCotizacion();
    } catch (error) {
      console.error(error);
      notify(error.message || "Error al devolver la cotización a revisión", {
        type: "error",
      });
    } finally {
      setAprobandoInterivalle(false);
    }
  };

  // Datos de actividades adicionales asociados a la cotizacion base.
  const personalizada = cotizacion?.personalizada || null;
  
  const adicionalesObraBlanca = personalizada?.obraBlanca || [];
  const adicionalesCarpinteria = personalizada?.carpinteria || [];
  const adicionalesVidrio = personalizada?.vidrio || [];
  const adicionalesMeson = personalizada?.mesonGranito || [];
	   
  const detalles = useMemo(() => detallesBase(cotizacion), [cotizacion]);

  const detallesCarpinteria = useMemo(() => {
    return detalles.filter(esDetalleCarpinteria);
  }, [detalles]);

  const detallesVidrio = useMemo(() => {
    return detalles.filter(esDetalleVidrio);
  }, [detalles]);

  const detallesMezon = useMemo(() => {
    return detalles.filter(esDetalleMezon);
  }, [detalles]);

  const productosEspecializadosBase = useMemo(() => {
    return new Set(
      [...detallesCarpinteria, ...detallesVidrio, ...detallesMezon]
        .map(obtenerClaveProductoEspecializado)
        .filter(Boolean)
    );
  }, [detallesCarpinteria, detallesVidrio, detallesMezon]);

  const semanasBase = useMemo(() => {
    return (cotizacion?.semanas || [])
      .map((semanaObj) => {
        const actividades = (semanaObj?.actividades || []).filter(
          (actividad) =>
            !esActividadServicioEspecializado(
              actividad,
              productosEspecializadosBase
            )
        );

        return recalcularSemanaBase(semanaObj, actividades);
      })
      .filter((semanaObj) => (semanaObj?.actividades || []).length > 0);
  }, [cotizacion, productosEspecializadosBase]);

  const semanasDisponibles = useMemo(() => {
    const semanas = semanasBase
      .map((item) => item?.semana)
      .filter((s) => s !== null && s !== undefined);

    return [...new Set(semanas)].sort((a, b) => a - b);
  }, [semanasBase]);

  const actividadesDisponibles = useMemo(() => {
    const actividades = [];

    semanasBase.forEach((semana) => {
      (semana?.actividades || []).forEach((act) => {
        if (act?.actividad && act.actividad.trim() !== "") {
          actividades.push(act.actividad);
        }
      });
    });

    return [...new Set(actividades)].sort((a, b) => a.localeCompare(b));
  }, [semanasBase]);

  const semanasFiltradas = useMemo(() => {
    return semanasBase
      .filter((semanaObj) => {
        const cumpleSemana =
          filtroSemana === "" ||
          Number(semanaObj?.semana) === Number(filtroSemana);

        if (!cumpleSemana) return false;

        if (filtroActividad === "") return true;

        return (semanaObj?.actividades || []).some(
          (act) =>
            normalizarTexto(act?.actividad) === normalizarTexto(filtroActividad)
        );
      })
      .map((semanaObj) => {
        const actividades = (semanaObj?.actividades || []).filter((act) => {
          if (filtroActividad === "") return true;
          return (
            normalizarTexto(act?.actividad) ===
            normalizarTexto(filtroActividad)
          );
        });

        return {
          ...semanaObj,
          actividades,
        };
      })
      .filter((semanaObj) => (semanaObj?.actividades || []).length > 0);
  }, [semanasBase, filtroSemana, filtroActividad]);

  const filasTabla = useMemo(() => {
    return construirFilasConRowSpan(semanasFiltradas);
  }, [semanasFiltradas]);

  const medidaAreaPrivada = useMemo(() => {
    return obtenerMedidaAreaPrivada(cotizacion);
  }, [cotizacion]);

  const serviciosSeleccionados = useMemo(() => {
    return obtenerServiciosSeleccionados(cotizacion, detalles);
  }, [cotizacion, detalles]);

  const tieneServicioObraBlanca = useMemo(() => {
    return serviciosSeleccionados.some((servicio) =>
      normalizarTexto(servicio).includes("obra blanca")
    );
  }, [serviciosSeleccionados]);

  const totalCarpinteria = useMemo(() => {
    return detallesCarpinteria.reduce(
      (acc, item) => acc + toNumber(item?.subtotalVenta),
      0
    );
  }, [detallesCarpinteria]);

  const totalVidrio = useMemo(() => {
    return detallesVidrio.reduce(
      (acc, item) => acc + toNumber(item?.subtotalVenta),
      0
    );
  }, [detallesVidrio]);

  const totalMezon = useMemo(() => {
    return detallesMezon.reduce(
      (acc, item) => acc + toNumber(item?.subtotalVenta),
      0
    );
  }, [detallesMezon]);

  const totalesFiltrados = useMemo(() => {
    let totalManoObra = 0;
    let totalMateriales = 0;
    let totalGeneral = 0;

    semanasFiltradas.forEach((semanaObj) => {
      totalManoObra += Number(semanaObj?.totalManoObra || 0);
      totalMateriales += Number(semanaObj?.totalMateriales || 0);
      totalGeneral +=
        Number(semanaObj?.totalManoObra || 0) +
        Number(semanaObj?.totalMateriales || 0);
    });

    return {
      totalManoObra,
      totalMateriales,
      totalGeneral,
    };
  }, [semanasFiltradas]);

  const totalManoObraMostrar =
    filtroSemana || filtroActividad
      ? totalesFiltrados.totalManoObra
      : toNumber(cotizacion?.totalManoObra);

  const totalMaterialesMostrar =
    filtroSemana || filtroActividad
      ? totalesFiltrados.totalMateriales
      : toNumber(cotizacion?.totalMateriales);

  const totalBaseMostrar =
    toNumber(cotizacion?.totalManoObra) +
    toNumber(cotizacion?.totalMateriales) +
    toNumber(cotizacion?.totalProductos);
  const totalAdicionalesMostrar = toNumber(cotizacion?.totalAdicionales);
																		   
									
												 
													  
		 
		

  const totalGeneralMostrar =
    toNumber(cotizacion?.totalGeneral) ||
    toNumber(cotizacion?.totalEstimado) ||
										
									 
	  
	  
						  
						   
					  
					 
	 

    totalBaseMostrar + totalAdicionalesMostrar;
								 
								 
											   

																		 
  const limpiarFiltros = () => {
    setFiltroSemana("");
    setFiltroActividad("");
  };

  const estadoCotizacion = normalizarTexto(cotizacion?.estado);
  const cotizacionAprobadaInterivalle =
    Boolean(cotizacion?.aprobadaInterivalle) || estadoCotizacion === "aprobada_final";
  const cotizacionAprobadaCliente =
    estadoCotizacion === "aprobada_cliente" || estadoCotizacion === "aprobada";
  const cotizacionAprobada = cotizacionAprobadaCliente || estadoCotizacion === "aprobada_final";
  const cotizacionAntesAprobar =
    estadoCotizacion === "generada" || estadoCotizacion === "en_revision";
  const cotizacionEditableAntesAprobar =
    esAdminSupervisor &&
    cotizacionAprobadaCliente &&
    !cotizacionAprobadaInterivalle;
  const puedeAprobarCotizacion =
    puedeGestionarCotizacion && cotizacionAntesAprobar;
  const puedeDevolverARevision =
    esAdminSupervisor && cotizacionAprobadaCliente && !cotizacionAprobadaInterivalle;
  const puedeAdicionarActividades =
    estadoCotizacion !== "rechazada" &&
    !cotizacionAprobada &&
    (esCliente && cotizacionAntesAprobar);
  const puedeClienteVolverEditar = esCliente && cotizacionAntesAprobar;
  const cronogramaDisponible = Boolean(
    cronogramaCotizacion?.idCronograma ||
      cotizacion?.idCronograma ||
      cotizacion?.cronogramaGenerado
  );
  const cronogramaPendienteInterValle =
    cronogramaCotizacion?.estadoCronograma === "PENDIENTE_APROBACION_EMPRESA" ||
    cronogramaCotizacion?.estadoCronograma === "PENDIENTE_APROBACION_INTERIVALLE";

  const fechasInicioDisponiblesSet = useMemo(() => {
    return new Set(
      fechasInicioDisponibles
        .map((item) => item?.fechaInicio)
        .filter(Boolean)
    );
  }, [fechasInicioDisponibles]);

  const etiquetaMesCalendario = useMemo(() => {
    return new Intl.DateTimeFormat("es-CO", {
      month: "long",
      year: "numeric",
    }).format(mesCalendario);
  }, [mesCalendario]);

  const diasCalendario = useMemo(() => {
    const inicioMes = new Date(
      mesCalendario.getFullYear(),
      mesCalendario.getMonth(),
      1
    );
    const inicioGrilla = new Date(inicioMes);
    inicioGrilla.setDate(inicioMes.getDate() - inicioMes.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const fecha = new Date(inicioGrilla);
      fecha.setDate(inicioGrilla.getDate() + index);

      const clave = claveFechaLocal(fecha);

      return {
        clave,
        fecha,
        disponible: fechasInicioDisponiblesSet.has(clave),
        enMesActual: fecha.getMonth() === mesCalendario.getMonth(),
        seleccionado: clave === fechaInicio,
      };
    });
  }, [fechaInicio, fechasInicioDisponiblesSet, mesCalendario]);

  const cambiarMesCalendario = (delta) => {
    setMesCalendario(
      (mesActual) =>
        new Date(mesActual.getFullYear(), mesActual.getMonth() + delta, 1)
    );
  };

  const irACronograma = () => {
    if (!cronogramaDisponible) {
      notify("No se encontró cronograma para esta cotización", { type: "warning" });
      return;
    }
    navigate(`/cronogramas/cotizacion/${idCotizacion}`);
  };

  const irASeguimiento = async () => {
    const cronograma =
      cronogramaCotizacion || (await cargarCronogramaCotizacion(true));

    if (!cronograma?.idCronograma) {
      notify("No se encontro cronograma para esta cotizacion", {
        type: "warning",
      });
      return;
    }

    if (
      cronograma?.estadoCronograma === "PENDIENTE_APROBACION_EMPRESA" ||
      cronograma?.estadoCronograma === "PENDIENTE_APROBACION_INTERIVALLE"
    ) {
      notify(
        "El seguimiento se habilitará cuando InterValle apruebe el cronograma.",
        { type: "info" }
      );
      return;
    }

    navigate(`/cronogramas/${cronograma.idCronograma}/seguimiento`);
  };

  const descargarPdf = () => {
    const ventanaPdf = window.open("", "_blank");

    if (!ventanaPdf) {
      notify("No se pudo abrir la ventana de descarga. Revisa el bloqueador de ventanas emergentes.", {
        type: "warning",
      });
      return;
    }

    const html = construirHtmlCotizacionPdf({
      cotizacion,
      medidaAreaPrivada,
      serviciosSeleccionados,
      filasBase: construirFilasConRowSpan(semanasBase),
      detallesCarpinteria,
      detallesVidrio,
      detallesMezon,
      adicionalesObraBlanca,
      adicionalesCarpinteria,
      adicionalesVidrio,
      adicionalesMeson,
      totales: {
        totalManoObra: toNumber(cotizacion?.totalManoObra),
        totalMateriales: toNumber(cotizacion?.totalMateriales),
        totalCarpinteria,
        totalVidrio,
        totalMezon,
        totalBase: totalBaseMostrar,
        totalAdicionales: totalAdicionalesMostrar,
        totalGeneral: totalGeneralMostrar,
      },
    });

    ventanaPdf.document.open();
    ventanaPdf.document.write(html);
    ventanaPdf.document.close();
    ventanaPdf.focus();

    setTimeout(() => {
      ventanaPdf.print();
    }, 400);
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
        <Typography mt={2}>Cargando cotización...</Typography>
      </Box>
    );
  }

  if (!cotizacion) {
    return (
      <Box p={4}>
        <Typography>No se encontró la cotización.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Cotización #{cotizacion.idCotizacion}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Proyecto: {cotizacion.nombreProyecto}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 1,
            mb: 4,
          }}
        >
          <Typography variant="body1">
            Estado: <strong>{cotizacion.estado}</strong>
          </Typography>

          {cotizacionAprobada && (
            <Typography variant="body1">
              Aprobación empresa:{" "}
              <strong>
                {cotizacionAprobadaInterivalle ? "APROBADA" : "PENDIENTE"}
              </strong>
            </Typography>
          )}

          <Typography variant="body1">
            Área privada: <strong>{formatearAreaPrivada(medidaAreaPrivada)}</strong>
          </Typography>

          <Typography variant="body1" sx={{ gridColumn: { md: "1 / -1" } }}>
            Servicios seleccionados:{" "}
            <strong>
              {serviciosSeleccionados.length > 0
                ? serviciosSeleccionados.join(", ")
                : "-"}
            </strong>
          </Typography>
        </Box>

        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Obra Blanca</Typography>
              <Typography variant="h6">
                {formatearMoneda(totalManoObraMostrar)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Materiales</Typography>
              <Typography variant="h6">
                {formatearMoneda(totalMaterialesMostrar)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Carpintería</Typography>
              <Typography variant="h6">
                {formatearMoneda(totalCarpinteria)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Divisiones en Vidrio</Typography>
              <Typography variant="h6">
                {formatearMoneda(totalVidrio)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Mesones Mármol</Typography>
              <Typography variant="h6">
                {formatearMoneda(totalMezon)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Base</Typography>
              <Typography variant="h6">
                {formatearMoneda(totalBaseMostrar)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Adicionales</Typography>
              <Typography variant="h6">
                {formatearMoneda(totalAdicionalesMostrar)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={estilos.resumenCardTotalGeneral}>
              <Typography variant="subtitle2">Total General</Typography>
              <Typography variant="h6">
                {formatearMoneda(totalGeneralMostrar)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          {cotizacionEditableAntesAprobar && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleDevolverARevision}
              disabled={aprobandoInterivalle}
            >
              {aprobandoInterivalle ? "DEVOLVIENDO..." : "DEVOLVER A REVISIÓN"}
            </Button>
          )}

          {puedeGestionarCotizacion && (
            <Button
              variant="contained"
              color="success"
              onClick={() => setOpenAprobar(true)}
              disabled={!puedeAprobarCotizacion}
            >
              APROBAR
            </Button>
          )}

          {puedeClienteVolverEditar && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/cotizacion-base/${idCotizacion}/editar`)}
            >
              VOLVER/EDITAR
            </Button>
          )}

          {puedeGestionarCotizacion && (
            <Button
              variant="contained"
              color="success"
              onClick={() =>
                navigate(`/cotizacion-personalizada/formularios/${idCotizacion}`)
              }
              disabled={!puedeAdicionarActividades}
            >
              ADICIONAR A COTIZACIÓN
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={irACronograma}
            disabled={!cotizacionAprobada || !cronogramaDisponible}
          >
            VER CRONOGRAMA
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={irASeguimiento}
            disabled={
              !cotizacionAprobada ||
              !cronogramaDisponible ||
              consultandoCronograma ||
              cronogramaPendienteInterValle
            }
          >
            {consultandoCronograma ? "CARGANDO..." : "VER SEGUIMIENTO"}
          </Button>

          <Button
            variant="outlined"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={descargarPdf}
          >
            DESCARGAR PDF
          </Button>
        </Box>

        <Typography variant="h5" fontWeight="bold" mb={2} mt={4}>
          Filtros
        </Typography>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Filtrar por semana"
              value={filtroSemana}
              onChange={(e) => setFiltroSemana(e.target.value)}
              variant="outlined"
              size="medium"
              sx={filtroSelectSx}
            >
              <MenuItem value="">Todas</MenuItem>
              {semanasDisponibles.map((semana) => (
                <MenuItem key={semana} value={semana}>
                  Semana {semana}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Filtrar por actividad"
              value={filtroActividad}
              onChange={(e) => setFiltroActividad(e.target.value)}
              variant="outlined"
              size="medium"
              sx={filtroSelectSx}
            >
              <MenuItem value="">Todas</MenuItem>
              {actividadesDisponibles.map((actividad) => (
                <MenuItem key={actividad} value={actividad}>
                  {actividad}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4} display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>

          </Grid>
        </Grid>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold">
            Detalle de la cotización base
          </Typography>

          {tieneServicioObraBlanca && (
            <Box sx={estilos.avisoMaterialesPropietario}>
              {avisoMaterialesPropietarioTexto}
            </Box>
          )}
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <table style={estilos.tabla}>
            <thead>
              <tr>
                <th style={estilos.th}>Semana</th>
                <th style={estilos.th}>Valor MANO OBRA semana</th>
                <th style={estilos.th}>Actividad</th>
                <th style={estilos.th}>Valor actividad</th>
                <th style={estilos.th}>Cantidad</th>
                <th style={estilos.th}>Material</th>
                <th style={estilos.th}>Precio material</th>
              </tr>
            </thead>
            <tbody>
              {filasTabla.length > 0 ? (
                filasTabla.map((fila, index) => {
                  const estiloMaterial =
                    tienePrecioMaterialCero(fila.precioMaterial)
                      ? estilos.tdMaterialPrecioCero
                      : estilos.td;

                  return (
                    <tr key={index}>
                      {fila.mostrarSemana && (
                        <td style={estilos.tdSemana} rowSpan={fila.rowSpanSemana}>
                          Semana {fila.semana}
                        </td>
                      )}

                      {fila.mostrarSemana && (
                        <td style={estilos.tdSemana} rowSpan={fila.rowSpanSemana}>
                          {formatearMoneda(fila.totalSemana)}
                        </td>
                      )}

                      {fila.mostrarActividad && (
                        <td
                          style={estilos.tdActividad}
                          rowSpan={fila.rowSpanActividad}
                        >
                          {fila.actividad}
                        </td>
                      )}

                      {fila.mostrarActividad && (
                        <td
                          style={estilos.tdActividad}
                          rowSpan={fila.rowSpanActividad}
                        >
                          {formatearMoneda(fila.precioActividad)}
                        </td>
                      )}

                      <td style={estiloMaterial}>
                        {fila.cantidad !== "" ? formatearNumero(fila.cantidad) : "-"}
                      </td>

                      <td style={estiloMaterial}>{fila.material || "-"}</td>

                      <td style={estiloMaterial}>
                        {fila.precioMaterial !== null
                          ? formatearMoneda(fila.precioMaterial)
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td style={estilos.td} colSpan="7">
                    No hay actividades de Obra Blanca para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        {detallesCarpinteria.length > 0 && (
          <TablaDetalleProductos
            titulo="Detalle Carpintería"
            detalles={detallesCarpinteria}
            total={totalCarpinteria}
            etiquetaTotal="Total Carpintería"
          />
        )}

        {detallesVidrio.length > 0 && (
          <TablaDetalleProductos
            titulo="Detalle Divisiones en Vidrio"
            detalles={detallesVidrio}
            total={totalVidrio}
            etiquetaTotal="Total Divisiones en Vidrio"
          />
        )}

        {detallesMezon.length > 0 && (
          <TablaDetalleProductos
            titulo="Detalle Mesones en Mármol"
            detalles={detallesMezon}
            total={totalMezon}
            etiquetaTotal="Total Mesones en Mármol"
          />
        )}

        <Typography variant="h5" fontWeight="bold" mt={5} mb={2}>
          Actividades adicionales
        </Typography>

        {adicionalesObraBlanca.length === 0 &&
        adicionalesCarpinteria.length === 0 &&
        adicionalesVidrio.length === 0 &&
        adicionalesMeson.length === 0 ? (
          <Typography>No hay actividades adicionales registradas.</Typography>
        ) : (
          <>
            {adicionalesObraBlanca.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" mt={2}>
                  Mano de Obra / Obra Blanca
                </Typography>

                <Box sx={{ overflowX: "auto" }}>
                  <table style={estilos.tabla}>
                    <thead>
                      <tr>
                        <th style={estilos.th}>Actividad</th>
                        <th style={estilos.th}>Lugar</th>
                        <th style={estilos.th}>Unidad</th>
                        <th style={estilos.th}>Cantidad</th>
                        <th style={estilos.th}>Medida</th>
                        <th style={estilos.th}>Precio Unitario</th>
                        <th style={estilos.th}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adicionalesObraBlanca.map((item, index) => (
                        <tr key={item.idObraBlanca || index}>
                          <td style={estilos.td}>{item.actividad || "-"}</td>
                          <td style={estilos.td}>{item.lugar || "-"}</td>
                          <td style={estilos.td}>{item.unidad || "-"}</td>
                          <td style={estilos.td}>{item.cantidad ?? "-"}</td>
                          <td style={estilos.td}>{formatearNumero(item.medida)}</td>
                          <td style={estilos.td}>
                            {formatearMoneda(item.precioUnitario)}
                          </td>
                          <td style={estilos.td}>
                            {formatearMoneda(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </>
            )}

            {adicionalesCarpinteria.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" mt={4}>
                  Carpintería adicional
                </Typography>
                                <Box sx={{ overflowX: "auto" }}>
                  <table style={estilos.tabla}>
                    <thead>
                      <tr>
                        <th style={estilos.th}>Tipo mueble</th>
                        <th style={estilos.th}>Material / Lugar</th>
                        <th style={estilos.th}>Cantidad</th>
                        <th style={estilos.th}>Largo</th>
                        <th style={estilos.th}>Ancho</th>
                        <th style={estilos.th}>Alto</th>
                        <th style={estilos.th}>Precio Unitario</th>
                        <th style={estilos.th}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adicionalesCarpinteria.map((item, index) => (
                        <tr key={item.idCarpinteria || index}>
                          <td style={estilos.td}>{item.tipoMueble || "-"}</td>
                          <td style={estilos.td}>{item.material || "-"}</td>
                          <td style={estilos.td}>{item.cantidad ?? "-"}</td>
                          <td style={estilos.td}>{formatearNumero(item.largo)}</td>
                          <td style={estilos.td}>{formatearNumero(item.ancho)}</td>
                          <td style={estilos.td}>{formatearNumero(item.alto)}</td>
                          <td style={estilos.td}>{formatearMoneda(item.precioUnitario)}</td>
                          <td style={estilos.td}>{formatearMoneda(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </>
            )}

            {adicionalesVidrio.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" mt={4}>
                  Vidrio adicional
                </Typography>
                <Box sx={{ overflowX: "auto" }}>
                  <table style={estilos.tabla}>
                    <thead>
                      <tr>
                        <th style={estilos.th}>Tipo vidrio</th>
                        <th style={estilos.th}>Cantidad</th>
                        <th style={estilos.th}>Precio Unitario</th>
                        <th style={estilos.th}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adicionalesVidrio.map((item, index) => (
                    <tr key={item.idVidrio || index}>
                      <td style={estilos.td}>{item.tipoVidrio || "-"}</td>
                      <td style={estilos.td}>{item.cantidad ?? "-"}</td>
                      <td style={estilos.td}>{formatearMoneda(item.precioUnitario)}</td>
                      <td style={estilos.td}>{formatearMoneda(item.subtotal)}</td>
                    </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </>
            )}

            {adicionalesMeson.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" mt={4}>
                  Mesón granito adicional
                </Typography>
                                <Box sx={{ overflowX: "auto" }}>
                  <table style={estilos.tabla}>
                    <thead>
                      <tr>
                        <th style={estilos.th}>Tipo granito</th>
                        <th style={estilos.th}>Cantidad</th>
                        <th style={estilos.th}>Precio Unitario</th>
                        <th style={estilos.th}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adicionalesMeson.map((item, index) => (
                    <tr key={item.idMeson || index}>
                      <td style={estilos.td}>{item.tipoGranito || "-"}</td>
                      <td style={estilos.td}>{item.cantidad ?? "-"}</td>
                      <td style={estilos.td}>{formatearMoneda(item.precioUnitario)}</td>
                      <td style={estilos.td}>{formatearMoneda(item.subtotal)}</td>
                    </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </>
            )}
          </>
        )}

        <Box mt={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#f8f9fb",
              border: "1px solid #ddd",
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Resumen final
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Total mano de obra:</strong>{" "}
              {formatearMoneda(totalManoObraMostrar)}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Total materiales:</strong>{" "}
              {formatearMoneda(totalMaterialesMostrar)}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Total carpintería:</strong>{" "}
              {formatearMoneda(totalCarpinteria)}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Total divisiones en vidrio:</strong>{" "}
              {formatearMoneda(totalVidrio)}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Total mesones mármol:</strong>{" "}
              {formatearMoneda(totalMezon)}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Total cotización base:</strong>{" "}
              {formatearMoneda(totalBaseMostrar)}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Total adicionales:</strong>{" "}
              {formatearMoneda(totalAdicionalesMostrar)}
            </Typography>

            <Typography variant="h6" color="success.main">
              <strong>Total general:</strong>{" "}
              {formatearMoneda(totalGeneralMostrar)}
            </Typography>
          </Paper>
        </Box>

        {puedeGestionarCotizacion && (
          <Dialog
            open={openAprobar}
            onClose={() => setOpenAprobar(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Fecha Inicio Obra</DialogTitle>

            <DialogContent>
              {cargandoFechasInicio ? (
                <Box py={4} display="flex" alignItems="center" gap={2}>
                  <CircularProgress size={24} />
                  <Typography>Cargando fechas...</Typography>
                </Box>
              ) : fechasInicioDisponibles.length === 0 ? (
                <Typography color="text.secondary" py={3}>
                  No hay fechas disponibles.
                </Typography>
              ) : (
                <Box mt={1}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <IconButton
                      aria-label="Mes anterior"
                      onClick={() => cambiarMesCalendario(-1)}
                      size="small"
                    >
                      <ChevronLeftIcon />
                    </IconButton>

                    <Typography fontWeight="bold" textTransform="capitalize">
                      {etiquetaMesCalendario}
                    </Typography>

                    <IconButton
                      aria-label="Mes siguiente"
                      onClick={() => cambiarMesCalendario(1)}
                      size="small"
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 0.75,
                    }}
                  >
                    {diasSemanaCalendario.map((dia) => (
                      <Typography
                        key={dia}
                        variant="caption"
                        textAlign="center"
                        fontWeight="bold"
                        color="text.secondary"
                      >
                        {dia}
                      </Typography>
                    ))}

                    {diasCalendario.map((dia) => (
                      <Button
                        key={dia.clave}
                        variant={dia.seleccionado ? "contained" : "outlined"}
                        color={dia.seleccionado ? "success" : "primary"}
                        disabled={!dia.disponible}
                        onClick={() => setFechaInicio(dia.clave)}
                        sx={{
                          minWidth: 0,
                          height: 42,
                          borderRadius: 1,
                          fontWeight: dia.disponible ? 700 : 400,
                          opacity: dia.enMesActual ? 1 : 0.35,
                          bgcolor:
                            dia.disponible && !dia.seleccionado
                              ? "#e8f5e9"
                              : undefined,
                          borderColor:
                            dia.disponible && !dia.seleccionado
                              ? "#2e7d32"
                              : undefined,
                          color:
                            dia.disponible && !dia.seleccionado
                              ? "#1b5e20"
                              : undefined,
                          "&.Mui-disabled": {
                            bgcolor: "#f3f3f3",
                            color: "#9e9e9e",
                            borderColor: "#e0e0e0",
                          },
                        }}
                      >
                        {dia.fecha.getDate()}
                      </Button>
                    ))}
                  </Box>

                  {fechaInicio && (
                    <Typography color="success.main" mt={2} fontWeight="bold">
                      Fecha seleccionada: {formatearFecha(fechaInicio)}
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenAprobar(false)}>Cancelar</Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleAprobar}
                disabled={
                  aprobando ||
                  cargandoFechasInicio ||
                  fechasInicioDisponibles.length === 0 ||
                  !fechaInicio
                }
              >
                {aprobando ? "Aprobando..." : "Confirmar"}
              </Button>
            </DialogActions>
          </Dialog>
        )}

      </Paper>
    </Box>
  );
};

export default CotizacionVista;






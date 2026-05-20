import simpleRestProvider from "ra-data-simple-rest";
import httpClient, { apiUrl } from "../app/httpClient";

const baseDataProvider = simpleRestProvider(`${apiUrl}/api`, httpClient);

const mapIdField = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      id:
        item.id ??
        item.idUsuario ??
        item.idSolicitud ??
        item.idCotizacion ??
        item.idCronograma ??
        item.idAvance ??
        item.idCatalogoItem,
    }));
    
  }

  return {
    ...data,
    id:
      data.id ??
      data.idUsuario ??
      data.idSolicitud ??
      data.idCotizacion ??
      data.idCronograma ??
      data.idAvance ??
      data.idCatalogoItem,
  };
};

const defaultSortFieldByResource = {
  solicitudes: "idSolicitud",
  cotizaciones: "idCotizacion",
  cronogramas: "idCronograma",
  "catalogo-items": "idCatalogoItem",
};

const applySortAndPagination = (json, params = {}, resource) => {
  let data = mapIdField(Array.isArray(json) ? json : []);
  const fallbackField = defaultSortFieldByResource[resource] || "id";
  const sortField = params.sort?.field === "id"
    ? fallbackField
    : params.sort?.field || fallbackField;
  const sortOrder = params.sort?.order || "DESC";

  data = [...data].sort((a, b) => {
    const aValue = a?.[sortField] ?? a?.id ?? 0;
    const bValue = b?.[sortField] ?? b?.id ?? 0;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "ASC" ? aValue - bValue : bValue - aValue;
    }

    const comparison = String(aValue).localeCompare(String(bValue), "es", {
      numeric: true,
      sensitivity: "base",
    });

    return sortOrder === "ASC" ? comparison : -comparison;
  });

  const total = data.length;
  const page = params.pagination?.page || 1;
  const perPage = params.pagination?.perPage || total || 10;
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    data: data.slice(start, end),
    total,
  };
};

const normalizarTexto = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const fechaSoloDia = (value) => {
  if (!value) return "";

  const texto = String(value);
  const isoDate = texto.match(/^(\d{4}-\d{2}-\d{2})/);

  if (isoDate) {
    return isoDate[1];
  }

  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const esCotizacionAprobada = (estado) =>
  normalizarTexto(estado) === "aprobada";

const enriquecerCotizacionesConCronogramas = (cotizaciones, cronogramas) => {
  const fechaInicioPorCotizacion = new Map(
    (Array.isArray(cronogramas) ? cronogramas : [])
      .filter((cronograma) => cronograma?.idCotizacion && cronograma?.fechaInicio)
      .map((cronograma) => [
        Number(cronograma.idCotizacion),
        cronograma.fechaInicio,
      ])
  );

  return (Array.isArray(cotizaciones) ? cotizaciones : []).map((cotizacion) => ({
    ...cotizacion,
    fechaInicio:
      cotizacion.fechaInicio ||
      fechaInicioPorCotizacion.get(Number(cotizacion.idCotizacion)) ||
      null,
  }));
};

const filtrarCotizaciones = (json, filtros = {}) => {
  let data = mapIdField(Array.isArray(json) ? json : []);
  const {
    fechaInicio,
    estado,
    nombreProyecto,
    nombreUsuario,
  } = filtros;

  if (fechaInicio) {
    const fechaFiltro = fechaSoloDia(fechaInicio);
    data = data.filter(
      (item) =>
        esCotizacionAprobada(item.estado) &&
        fechaSoloDia(item.fechaInicio) === fechaFiltro
    );
  }

  if (estado) {
    const estadoFiltro = normalizarTexto(estado);
    data = data.filter((item) => normalizarTexto(item.estado) === estadoFiltro);
  }

  if (nombreProyecto) {
    const proyectoFiltro = normalizarTexto(nombreProyecto);
    data = data.filter((item) =>
      normalizarTexto(item.nombreProyecto).includes(proyectoFiltro)
    );
  }

  if (nombreUsuario) {
    const clienteFiltro = normalizarTexto(nombreUsuario);
    data = data.filter((item) =>
      normalizarTexto(item.nombreUsuario).includes(clienteFiltro)
    );
  }

  return data;
};

const filtrarCronogramas = (json, filtros = {}) => {
  let data = mapIdField(Array.isArray(json) ? json : []);
  const {
    fechaInicio,
    estadoCronograma,
    nombreProyecto,
    nombreCliente,
    fechaFin,
  } = filtros;

  if (fechaInicio) {
    const fechaFiltro = fechaSoloDia(fechaInicio);
    data = data.filter((item) => fechaSoloDia(item.fechaInicio) === fechaFiltro);
  }

  if (estadoCronograma) {
    const estadoFiltro = normalizarTexto(estadoCronograma);
    data = data.filter(
      (item) => normalizarTexto(item.estadoCronograma) === estadoFiltro
    );
  }

  if (nombreProyecto) {
    const proyectoFiltro = normalizarTexto(nombreProyecto);
    data = data.filter((item) =>
      normalizarTexto(item.nombreProyecto).includes(proyectoFiltro)
    );
  }

  if (nombreCliente) {
    const clienteFiltro = normalizarTexto(nombreCliente);
    data = data.filter((item) =>
      normalizarTexto(item.nombreCliente).includes(clienteFiltro)
    );
  }

  if (fechaFin) {
    const fechaFiltro = fechaSoloDia(fechaFin);
    data = data.filter((item) => fechaSoloDia(item.fechaFin) === fechaFiltro);
  }

  return data;
};

const dataProvider = {
  ...baseDataProvider,

getList: async (resource, params) => {
  if (resource === "solicitudes") {
    const correoUsuario = params.filter?.correoUsuario || "";

    const url = `${apiUrl}/api/solicitudes${
      correoUsuario
        ? `?correoUsuario=${encodeURIComponent(correoUsuario)}`
        : ""
    }`;

    const { json } = await httpClient(url);

    return applySortAndPagination(json, params, resource);
  }

  if (resource === "cotizaciones") {
    const idRol = Number(localStorage.getItem("idRol"));
    const correoUsuario =
      params.filter?.correoUsuario ||
      localStorage.getItem("correoUsuario") ||
      localStorage.getItem("usuarioCorreo") ||
      "";

    let url = `${apiUrl}/api/cotizaciones`;

    // Cliente: solo sus cotizaciones
    if (idRol === 3) {
      url = `${apiUrl}/api/cliente/cotizaciones${
        correoUsuario
          ? `?correoUsuario=${encodeURIComponent(correoUsuario)}`
          : ""
      }`;
    }

    const { json } = await httpClient(url);
    let cotizaciones = json;

    if (idRol === 1 || idRol === 2) {
      try {
        const { json: cronogramas } = await httpClient(
          `${apiUrl}/api/cliente/cronogramas`
        );

        cotizaciones = enriquecerCotizacionesConCronogramas(json, cronogramas);
      } catch (error) {
        console.error("Error cargando fechas de inicio de cronogramas:", error);
      }
    }

    const data = filtrarCotizaciones(cotizaciones, params.filter);

    return applySortAndPagination(data, params, resource);
  }

   if (resource === "cronogramas") {
      const { json } = await httpClient(`${apiUrl}/api/cliente/cronogramas`);
      const data = filtrarCronogramas(json, params.filter);

      return applySortAndPagination(data, params, resource);
    }

    if (resource === "catalogo-items") {
        const { json } = await httpClient(`${apiUrl}/api/catalogo-items`);

        let data = mapIdField(json);

        const filtro = params.filter || {};

        if (filtro.q) {
          const q = filtro.q.toLowerCase();

          data = data.filter((item) =>
            String(item.nombreItem || "").toLowerCase().includes(q) ||
            String(item.categoria || "").toLowerCase().includes(q) ||
            String(item.tipoItem || "").toLowerCase().includes(q) ||
            String(item.nombreServicio || "").toLowerCase().includes(q)
          );
        }

        if (filtro.tipoItem) {
          data = data.filter((item) => item.tipoItem === filtro.tipoItem);
        }

        if (filtro.categoria) {
          data = data.filter((item) =>
            String(item.categoria || "")
              .toLowerCase()
              .includes(filtro.categoria.toLowerCase())
          );
        }

        if (filtro.nombreServicio) {
          data = data.filter((item) =>
            String(item.nombreServicio || "")
              .toLowerCase()
              .includes(filtro.nombreServicio.toLowerCase())
          );
        }

        return applySortAndPagination(data, params, resource);
      }

  const response = await baseDataProvider.getList(resource, params);
  return {
    ...response,
    data: mapIdField(response.data),
  };
},
  
getOne: async (resource, params) => {
  if (resource === "cotizaciones") {
  const idRol = Number(localStorage.getItem("idRol"));

  const url =
    idRol === 3
      ? `${apiUrl}/api/cliente/cotizaciones/${params.id}`
      : `${apiUrl}/api/cotizaciones/${params.id}`;

  const { json } = await httpClient(url);

  return {
    data: mapIdField(json),
  };
}
  const response = await baseDataProvider.getOne(resource, params);
  return {
    ...response,
    data: mapIdField(response.data),
  };
},

  getMany: async (resource, params) => {
    const response = await baseDataProvider.getMany(resource, params);
    return {
      ...response,
      data: mapIdField(response.data),
    };
  },

  getManyReference: async (resource, params) => {
    const response = await baseDataProvider.getManyReference(resource, params);
    return {
      ...response,
      data: mapIdField(response.data),
    };
  },


  create: async (resource, params) => {
  if (resource === "catalogo-items") {
    const { json } = await httpClient(
      `${apiUrl}/api/catalogo-items`,
      {
        method: "POST",
        body: JSON.stringify(params.data),
      }
    );

    return {
      data: mapIdField(json),
    };
  }

  const response = await baseDataProvider.create(resource, params);

  return {
    ...response,
    data: mapIdField(response.data),
  };
},


    update: async (resource, params) => {
      if (resource === "catalogo-items") {
        const { json } = await httpClient(
          `${apiUrl}/api/catalogo-items/${params.id}/precio`,
          {
            method: "PUT",
            body: JSON.stringify(params.data),
          }
        );

        return {
          data: mapIdField(json),
        };
      }

      const response = await baseDataProvider.update(resource, params);

      return {
        ...response,
        data: mapIdField(response.data),
      };
    },

};

export default dataProvider;

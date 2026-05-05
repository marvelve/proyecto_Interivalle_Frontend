import {apiUrl} from "../../app/httpClient";

const getToken = () => localStorage.getItem("token");

export const listarAvancesPorCronograma = async (idCronograma) => {
  const response = await fetch(`${apiUrl}/api/avances/cronograma/${idCronograma}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudieron listar los avances");
  }

  return await response.json();
};

export const obtenerCronogramaPorId = async (idCronograma) => {
  const response = await fetch(`${apiUrl}/api/cliente/cronogramas`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo cargar el cronograma");
  }

  const cronogramas = await response.json();

  return (Array.isArray(cronogramas) ? cronogramas : []).find(
    (item) => Number(item.idCronograma) === Number(idCronograma)
  );
};

export const obtenerAvancePorId = async (idAvance) => {
  const response = await fetch(`${apiUrl}/api/avances/${idAvance}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo cargar el avance");
  }

  return await response.json();
};

export const crearAvance = async (payload) => {
  const response = await fetch(`${apiUrl}/api/avances`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo registrar el avance");
  }

  return await response.json();
};

export const actualizarAvance = async (idAvance, payload) => {
  const response = await fetch(`${apiUrl}/api/avances/${idAvance}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo actualizar el avance");
  }

  return await response.json();
};

export const listarComentarios = async (idAvance) => {
  const response = await fetch(`${apiUrl}/api/avances/${idAvance}/comentarios`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudieron listar los comentarios");
  }

  return await response.json();
};

export const crearComentario = async (payload) => {
  const response = await fetch(`${apiUrl}/api/avances/comentarios`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo guardar el comentario");
  }

  return await response.json();
};

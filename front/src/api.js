const BASE_URL = "http://localhost:4100/ciudadano";

async function fetchData(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return await res.json();
}

export function getCiudadanos() {
  return fetchData("/listarTodos").then(json => json.resultado);
}

export function buscarxID(codigo) {
  return fetch(`${BASE_URL}/buscarxid/${codigo}`)
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(json => json.data[0]);  // tu endpoint devuelve { data: [ {...} ] }
}

export function actualizarCiudadano(codigo, campos) {
  return fetch(`${BASE_URL}/actualizar/${codigo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campos)
  }).then(res => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });
}

export function crearCiudadano(datos) {
  return fetch(`${BASE_URL}/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  }).then(res => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });
}
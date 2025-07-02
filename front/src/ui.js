// src/ui.js
/**
 * Renderiza la tabla de ciudadanos
 * @param {Array<Object>} ciudadanos
 */
export function renderCiudadanoList(ciudadanos) {
  const tbody = document.querySelector('#tabla-ciudadanos tbody');
  tbody.innerHTML = '';

  ciudadanos.forEach(c => {
    const tr = document.createElement('tr');
    const fecha = new Date(c.fechaNacimiento).toLocaleDateString();
    tr.innerHTML = `
      <td>${c.codigo}</td>
      <td>${c.nombre}</td>
      <td>${c.apellidos}</td>
      <td>${c.apodo || '-'}</td>
      <td>${fecha}</td>
      <td>${c.planetaOrigen}</td>
      <td>${c.planetaResidencia}</td>
      <td>${c.estado}</td>
      <td>
        <img src="http://localhost:4100${c.codigoQr}" width="60" height="60">
      </td>
        <td>
            <button class="btn btn-primary btn-sm" onclick="openEditModal('${c.codigo}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCiudadano('${c.codigo}')">Eliminar</button>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Muestra un mensaje de error
 * @param {string} msg
 */
export function renderError(msg) {
  const errEl = document.getElementById('errorContainer');
  errEl.textContent = msg;
  errEl.style.display = 'block';
}
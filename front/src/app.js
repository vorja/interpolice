import { buscarxID, actualizarCiudadano, crearCiudadano } from './api.js';

let editModal, createModal;

document.addEventListener('DOMContentLoaded', () => {
 
  const editModalEl = document.getElementById('editModal');
  editModal = new bootstrap.Modal(editModalEl);

  const createModalEl = document.getElementById('Modal');
  createModal = new bootstrap.Modal(createModalEl);

  document.getElementById('editForm').addEventListener('submit', async e => {
    e.preventDefault();
    const codigo          = document.getElementById('editCodigo').value;
    const nombre          = document.getElementById('editNombre').value;
    const apellidos       = document.getElementById('editApellidos').value;
    const apodo           = document.getElementById('editApodo').value || null;
    const fechaNacimiento = document.getElementById('editFechaNacimiento').value;
    const planetaOrigen   = document.getElementById('editPlanetaOrigen').value;
    const planetaResidencia = document.getElementById('editPlanetaResidencia').value;
    const estado          = document.querySelector('input[name="editEstado"]:checked').value;

    try {
      await actualizarCiudadano(codigo, {
        nombre, apellidos, apodo,
        fechaNacimiento, planetaOrigen, planetaResidencia, estado
      });
      editModal.hide();
      window.location.reload();
    } catch (err) {
      alert('Error al guardar cambios');
      console.error(err);
    }
  });

  document.getElementById('crearCiudadano').addEventListener('submit', async e => {
    e.preventDefault();
    const datos = {
      nombre:            document.getElementById('Nombre').value,
      apellidos:         document.getElementById('Apellidos').value,
      apodo:             document.getElementById('Apodo').value || null,
      fechaNacimiento:   document.getElementById('FechaNacimiento').value,
      planetaOrigen:     document.getElementById('PlanetaOrigen').value,
      planetaResidencia: document.getElementById('PlanetaResidencia').value,
      estado:            document.querySelector('input[name="Estado"]:checked').value
    };
    try {
      await crearCiudadano(datos);
      createModal.hide();
      window.location.reload();
    } catch (err) {
      alert('Error al crear ciudadano');
      console.error(err);
    }
  });
});

window.opencrearCiudadano = function() {
  document.getElementById('crearCiudadano').reset();
  document.getElementById('estadoVivo').checked = true;
  createModal.show();
};

window.openEditModal = async function(codigo) {
  try {
    const c = await buscarxID(codigo);
    document.getElementById('editCodigo').value         = c.codigo;
    document.getElementById('editNombre').value         = c.nombre;
    document.getElementById('editApellidos').value      = c.apellidos;
    document.getElementById('editApodo').value          = c.apodo || '';
    document.getElementById('editFechaNacimiento').value = c.fechaNacimiento.split('T')[0];
    document.getElementById('editPlanetaOrigen').value  = c.planetaOrigen;
    document.getElementById('editPlanetaResidencia').value = c.planetaResidencia;
    document.querySelector(`input[name="editEstado"][value="${c.estado}"]`).checked = true;
    editModal.show();
  } catch (err) {
    alert('Error al cargar datos');
    console.error(err);
  }
};

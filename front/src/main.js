import { getCiudadanos } from "./api.js";
import { renderCiudadanoList} from "./ui.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const ciudadanos = await getCiudadanos();
    renderCiudadanoList(ciudadanos);
  } catch (err) {
    console.error("Error en la inicialización:", err);
    renderError("No se pudieron cargar los ciudadanos.");
  }
});

import express from 'express';
import "dotenv/config";
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';


import { verifyToken } from "./src/config/authMiddleware.js";
   

import ciudadanos from "./src/modules/ciudadanos/ciudadano.routes.js";
import usuarios from "./src/modules/usuarios/usuarios.js";
import delitoTipos from "./src/modules/delitoTipos/delitoTipos.js";
import delitoEventos from "./src/modules/delitoEventos/delitoEventos.routes.js";
import antecedentes from "./src/modules/antecedentes/antecedentes.js";
import amonestaciones from "./src/modules/amonestaciones/amonestaciones.js";
  

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
import 'dotenv/config';

app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/api", usuarios); 

app.use("/api", verifyToken);

app.use("/api", ciudadanos);
app.use("/api", delitoTipos);
app.use("/api", delitoEventos);
app.use("/api", antecedentes);
app.use("/api", amonestaciones);

app.use("./src/modules/qr", express.static(path.join(__dirname, "qr")));
app.use("/fotos", express.static(path.join(__dirname, "fotos")));

const port = process.env.APP_port || 4100;
app.listen(port, () => {
    console.log(`Api ejecutándose en el puerto http://localhost:${port}`);
});

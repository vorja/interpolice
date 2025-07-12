import express from 'express';
import path from 'path';
import cors from 'cors';
import ciudadano from './src/ciudadanos.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import usuario from './src/modules/usuarios/usuarios.js';  

   

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use('/qrCodes', express.static(__dirname + '/qrCodes'));

app.use(cors());                                  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/usuario', usuario);    
app.use('/ciudadano', ciudadano);                 
app.use('/', express.static(path.join(process.cwd(), 'public')));  

const PORT = process.env.APP_PORT || 4100;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

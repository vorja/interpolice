//libreria para conectarse a la base de datos mysql
import mysql from 'mysql2/promise';
import 'dotenv/config';

//creamos el objeto de conexión a la base de datos deacuerdo a la librería mysql2
const dbconn = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
});

try {
    //metodo de mysql2 se conecta a la base de datos
    await dbconn.connect();
    console.log('Conexión exitosa a la base de datos');

} catch (err) {
    console.log('Error al conectar a la base de datos:', err);
}

//exportamos el objeto de conexión para que pueda ser utilizado en otros archivos
export default dbconn;
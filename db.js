import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
};

const connection = mysql.createConnection(dbConfig);

connection.connect((error) => {
  if (error) {
    console.log("El error de conexión es: " + error);
    return;
  }
  console.log("¡Conectado a la Base de Datos!");
});

export default connection;
export { dbConfig }; // Exporta también la variable dbConfig

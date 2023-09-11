var sqlcon = require("mssql");

// Configuración de la base de datos
const config = {
    user: "AsociaTEC",
    password: "asociadmin",
    server: "AsociaTEC.mssql.somee.com",
    database: "AsociaTEC",
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

// Creación de pool a la base de datos
const pool = new sqlcon.ConnectionPool(config);

// Conexión a la base de datos
async function conexion() {
    try {
        await pool.connect();
        console.log("Conexión exitosa a la base de datos de Somee");
    } catch (err) {
        console.error("Conexión fallida a la base de datos de Somee", err);
    }
}

conexion();

module.exports = { pool, sqlcon };
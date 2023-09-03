var sqlcon = require("mssql");

// Configuración de la base de datos
const config = {
    user: "AsociaTEC",
    password: "asociadmin",
    server: "AsociaTEC.mssql.somee.com",
    database: "AsociaTEC",
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

// Establecer conexión a la base de datos de Somee
sqlcon.connect(config, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Conexión exitosa a la base de datos de Somee");
    }
});

module.exports = { sqlcon };

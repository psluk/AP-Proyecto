const express = require("express");
const sqlcon = require("mssql");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

const loginRouter = require("./routes/login.js");
const eventosRouter = require("./routes/eventos.js");
const recursosRouter = require("./routes/recursos.js");
const actividadesRouter = require("./routes/actividades.js");
const colaboradoresRouter = require("./routes/colaboradores.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        key: "userId",
        secret: "NoAutorizamosQueNosHackeen",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 /* Un día (en milisegundos) */,
        },
    })
);
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de rutas
app.use("/api/", loginRouter);
app.use("/api/eventos/", eventosRouter);
app.use("/api/recursos/", recursosRouter);
app.use("/api/actividades/", actividadesRouter);
app.use("/api/colaboradores/", colaboradoresRouter);

app.listen(port, () => {
    console.log(`AsociaTEC app listening on port ${port}`);
});

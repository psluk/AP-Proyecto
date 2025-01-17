const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const { conexion } = require("./settings/database.js");
const { notificar } = require("./settings/notificar.js");

// INICIALIZAR
async function iniciar() {
    await conexion();
    notificar(false);
}
iniciar();

// CLIENT FILES
const CLIENT_FILES = path.join(__dirname, "./client/dist/");

const app = express();

const loginRouter = require("./routes/login.js");
const eventosRouter = require("./routes/eventos.js");
const recursosRouter = require("./routes/recursos.js");
const actividadesRouter = require("./routes/actividades.js");
const colaboradoresRouter = require("./routes/colaboradores.js");
const solicitudesRouter = require("./routes/solicitudes.js");
const asociacionesRouter = require("./routes/asociaciones.js");
const conversacionesRouter = require("./routes/conversaciones.js");
const mensajesRouter = require("./routes/mensajes.js");
const encuestasRouter = require("./routes/encuestas.js");
const estudiantesRouter = require("./routes/estudiantes.js");
const inscripcionesRouter = require("./routes/inscripciones.js");
const interesRouter = require("./routes/interes.js");
const propuestasRouter = require("./routes/propuestas.js");
const sedesRouter = require("./routes/sedes.js");
const carrerasRouter = require("./routes/carreras.js");

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: [
            "https://asociatec.azurewebsites.net",
            /https:\/\/asociatec.azurewebsites.net\/.+/,
            "http://localhost:5173",
            /http:\/\/localhost:5173\/.+/,
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
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
app.use(express.static(CLIENT_FILES));
app.disable("x-powered-by");

// Configuración de rutas
app.use("/api/", loginRouter);
app.use("/api/eventos/", eventosRouter);
app.use("/api/recursos/", recursosRouter);
app.use("/api/actividades/", actividadesRouter);
app.use("/api/colaboradores/", colaboradoresRouter);
app.use("/api/colaboradores/solicitudes/", solicitudesRouter);
app.use("/api/asociaciones/", asociacionesRouter);
app.use("/api/conversaciones/", conversacionesRouter);
app.use("/api/conversaciones/mensajes/", mensajesRouter);
app.use("/api/encuestas", encuestasRouter);
app.use("/api/estudiantes", estudiantesRouter);
app.use("/api/inscripciones", inscripcionesRouter);
app.use("/api/interes", interesRouter);
app.use("/api/propuestas", propuestasRouter);
app.use("/api/sedes", sedesRouter);
app.use("/api/carreras", carrerasRouter);

app.get("*", (req, res) => {
    res.sendFile(path.join(CLIENT_FILES, "index.html"));
});

module.exports = app;
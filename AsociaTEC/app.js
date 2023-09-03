const express = require("express");
const sqlcon = require("mssql");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

const loginRouter = require("./routes/login.js");

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

app.use("/api/", loginRouter);

app.listen(port, () => {
    console.log(`AsociaTEC app listening on port ${port}`);
});

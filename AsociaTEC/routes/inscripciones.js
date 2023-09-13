const express = require("express");
const router = express.Router();
const { pool, sqlcon } = require("../settings/database.js");
const manejarError = require("../settings/errores.js");
const estaAutenticado = require("../settings/autenticado.js");
const qr = require("qrcode");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const fs = require("fs");
const { enviarCorreo } = require("../settings/correos.js");
const {
    idiomaLocal,
    formatoFecha,
    formatoHora,
} = require("../settings/formatos.js");

/**
 * Método GET
 * Retorna la lista de inscripciones
 */
router.get("/", (req, res) => {
    const { evento, carnet } = req.query;

    if (carnet) {
        if (!estaAutenticado(req, true, true, carnet)) {
            return res.status(403).send({ mensaje: "Acceso denegado" });
        }
    } else {
        if (!estaAutenticado(req, true, true)) {
            return res.status(403).send({ mensaje: "Acceso denegado" });
        }
    }

    const request = pool.request();

    try {
        if (evento) {
            request.input("IN_evento", sqlcon.UniqueIdentifier, evento);
        }

        if (carnet) {
            request.input("IN_carnet", sqlcon.Int, carnet);
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Inscripciones_Lista", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

/**
 * Método GET
 * Retorna los detalles de una inscripción
 */
router.get("/detalles", (req, res) => {
    const { evento, carnet } = req.query;

    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    try {
        if (evento) {
            request.input("IN_evento", sqlcon.UniqueIdentifier, evento);
        }

        if (carnet) {
            request.input("IN_carnet", sqlcon.Int, carnet);
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Inscripciones_Detalles", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.setHeader("Content-Type", "application/json").send(
                result.recordset[0]["results"]
            );
        }
    });
});

/**
 * Método GET
 * Retorna el código QR de una inscripción
 */
router.get("/qr", (req, res) => {
    const { evento, carnet } = req.query;

    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    try {
        if (evento) {
            request.input("IN_evento", sqlcon.UniqueIdentifier, evento);
        }

        if (carnet) {
            request.input("IN_carnet", sqlcon.Int, carnet);
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Inscripciones_QR", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            qr.toBuffer(result.recordset[0]["results"], async (err, texto) => {
                if (err) {
                    console.error("Error generating QR code:", err);
                    return res.sendStatus(500);
                }

                res.setHeader("Content-Type", "image/png");
                res.setHeader(
                    "Content-Disposition",
                    'inline; filename="qr.png"'
                );

                return res.send(texto);
            });
        }
    });
});

/**
 * Método POST
 * Agrega una inscripción
 */
router.post("/agregar", (req, res) => {
    const { evento, carnet } = req.body;

    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    try {
        if (evento) {
            request.input("IN_evento", sqlcon.UniqueIdentifier, evento);
        }

        if (carnet) {
            request.input("IN_carnet", sqlcon.Int, carnet);
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Inscripciones_Agregar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            res.status(200).send({ mensaje: "Registrado con éxito" });

            // En caso de que se haya alcanzado el límite, hay que notificar a la asociación
            const resultado = JSON.parse(result.recordset[0]["results"])[0];

            // Formato de la hora
            const hora_obj = new Date(info.timestamp);

            // Se agrega "la" o "las" dependiendo de la hora
            const hora =
                (hora_obj.getHours() % 12 == 1 ? "la" : "las") +
                " " +
                new Intl.DateTimeFormat(idiomaLocal, formatoHora)
                    .format(hora_obj)
                    .replace(/(00)(:\d{2})/, "12$2") +
                " del " +
                new Intl.DateTimeFormat(idiomaLocal, formatoFecha).format(
                    hora_obj
                );

            if (resultado.maximoAlcanzado) {
                enviarCorreo(
                    resultado.correo,
                    "Cupo alcanzado:" + resultado.evento.titulo,
                    `<p>Hola:</p>
                    <p>Se le notifica a su asociación (${resultado.asociacion.nombre}) que a 
                    ${hora} se alcanzó la capacidad máxima de ${resultado.evento.capacidad} en el
                    evento <b>${resultado.evento.titulo}</b>.</p>`
                );
            }
        }
    });
});

/**
 * Método PUT
 * Confirma una inscripción
 */
router.put("/confirmar", (req, res) => {
    const { evento, carnet } = req.body;

    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }
    const request = pool.request();

    try {
        if (evento) {
            request.input("IN_evento", sqlcon.UniqueIdentifier, evento);
        }

        if (carnet) {
            request.input("IN_carnet", sqlcon.Int, carnet);
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Inscripciones_Confirmar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            const info = JSON.parse(result.recordset[0]["results"])[0];
            const stJson = result.recordset[1]["results"];

            qr.toDataURL(stJson, async (err, url) => {
                const pdfDoc = await PDFDocument.create();
                pdfDoc.registerFontkit(fontkit);
                const page = pdfDoc.addPage([612, 280]);

                // Configuración del PDF
                const response = await fetch(url);
                const imageBytes = await response.arrayBuffer();
                const margenLateral = 50;
                const font_size = 14;
                let label_width;

                // Fuentes
                const fontBytes_RobotoSlab = fs.readFileSync(
                    "assets/fonts/RobotoSlab-Bold.ttf"
                );
                const RobotoSlab_Ref = await pdfDoc.embedFont(
                    fontBytes_RobotoSlab
                );

                const fontBytes_Roboto = fs.readFileSync(
                    "assets/fonts/Roboto-Regular.ttf"
                );
                const Roboto_Ref = await pdfDoc.embedFont(fontBytes_Roboto);
                const altoLinea = Roboto_Ref.heightAtSize(font_size);

                const fontBytes_RobotoBold = fs.readFileSync(
                    "assets/fonts/Roboto-Bold.ttf"
                );
                const RobotoBold_Ref = await pdfDoc.embedFont(
                    fontBytes_RobotoBold
                );

                // Inserción del QR y del texto en el PDF

                // Inserción del título
                const titulo = "Confirmación de inscripción";
                const titulo_size = 20;
                const titulo_color = rgb(0 / 255, 80 / 255, 133 / 255); // Color de énfasis
                const altoTitulo = RobotoSlab_Ref.heightAtSize(titulo_size);
                let ultimo_inicioY = page.getHeight() - 40;
                page.drawText(titulo, {
                    x: margenLateral,
                    y: ultimo_inicioY - altoTitulo / 2,
                    size: titulo_size,
                    font: RobotoSlab_Ref,
                    color: titulo_color,
                });

                // Inserción del logo
                const asociatec = "ASOCIATEC";
                const anchoAsociatec = RobotoSlab_Ref.widthOfTextAtSize(
                    asociatec,
                    titulo_size
                );
                page.drawText(asociatec, {
                    x: page.getWidth() - margenLateral - anchoAsociatec,
                    y: ultimo_inicioY - altoTitulo / 2,
                    size: titulo_size,
                    font: RobotoSlab_Ref,
                    color: titulo_color,
                });

                const logoImageBytes = fs.readFileSync("assets/img/logo.png");
                const logoImage = await pdfDoc.embedPng(logoImageBytes);
                const logoDims = logoImage.scale(0.45);
                page.drawImage(logoImage, {
                    x:
                        page.getWidth() -
                        margenLateral -
                        anchoAsociatec -
                        logoDims.width -
                        7,
                    y:
                        ultimo_inicioY -
                        altoTitulo / 2 -
                        logoDims.height / 2 +
                        8,
                    width: logoDims.width,
                    height: logoDims.height,
                });

                // Inserción del QR
                ultimo_inicioY = ultimo_inicioY - altoTitulo - 30;
                const qrImage = await pdfDoc.embedPng(imageBytes);
                const qrDims = qrImage.scale(0.75);
                page.drawImage(qrImage, {
                    x: page.getWidth() - qrDims.width - margenLateral + 15,
                    y: ultimo_inicioY - qrDims.height + 15,
                    width: qrDims.width,
                    height: qrDims.height,
                });

                // Inserción de los demás datos
                const mensaje =
                    "Se ha confirmado su inscripción exitosamente.\nLos datos son los siguientes:";
                page.drawText(mensaje, {
                    x: margenLateral,
                    y: ultimo_inicioY,
                    font: Roboto_Ref,
                    size: font_size,
                });
                ultimo_inicioY -= altoLinea;

                const horaInicio_texto =
                    new Intl.DateTimeFormat(idiomaLocal, formatoHora)
                        .format(new Date(info.evento.inicio))
                        .replace(/(00)(:\d{2})/, "12$2") +
                    " (" +
                    new Intl.DateTimeFormat(idiomaLocal, formatoFecha).format(
                        new Date(info.evento.inicio)
                    ) +
                    ")";
                const horaInicio_label = "· Inicio: ";
                ultimo_inicioY = ultimo_inicioY - altoLinea - 20;
                page.drawText(horaInicio_label, {
                    x: margenLateral,
                    y: ultimo_inicioY,
                    font: RobotoBold_Ref,
                    size: font_size,
                });
                label_width = RobotoBold_Ref.widthOfTextAtSize(
                    horaInicio_label,
                    font_size
                );
                page.drawText(horaInicio_texto, {
                    x: margenLateral + label_width + 5,
                    y: ultimo_inicioY,
                    font: Roboto_Ref,
                    size: font_size,
                });

                // Hay un error que hace que las 12:## a. m. o las 12:## p. m.
                // se muestren como 0:## a. m. o 0:## p. m., entonces para eso es el .replace()
                const horaFin_texto =
                    new Intl.DateTimeFormat(idiomaLocal, formatoHora)
                        .format(new Date(info.evento.fin))
                        .replace(/(00)(:\d{2})/, "12$2") +
                    " (" +
                    new Intl.DateTimeFormat(idiomaLocal, formatoFecha).format(
                        new Date(info.evento.fin)
                    ) +
                    ")";
                const horaFin_label = "· Fin: ";
                ultimo_inicioY = ultimo_inicioY - altoLinea - 8;
                page.drawText(horaFin_label, {
                    x: margenLateral,
                    y: ultimo_inicioY,
                    font: RobotoBold_Ref,
                    size: font_size,
                });
                label_width = RobotoBold_Ref.widthOfTextAtSize(
                    horaFin_label,
                    font_size
                );
                page.drawText(horaFin_texto, {
                    x: margenLateral + label_width + 5,
                    y: ultimo_inicioY,
                    font: Roboto_Ref,
                    size: font_size,
                });

                const evento_texto = info.evento.nombre;
                const evento_label = "· Evento: ";
                ultimo_inicioY = ultimo_inicioY - altoLinea - 8;
                page.drawText(evento_label, {
                    x: margenLateral,
                    y: ultimo_inicioY,
                    font: RobotoBold_Ref,
                    size: font_size,
                });
                label_width = RobotoBold_Ref.widthOfTextAtSize(
                    evento_label,
                    font_size
                );
                page.drawText(evento_texto, {
                    x: margenLateral + label_width + 5,
                    y: ultimo_inicioY,
                    font: Roboto_Ref,
                    size: font_size,
                });

                // Guardado del PDF
                const pdfBytes = await pdfDoc.save();

                // Envío de correos
                enviarCorreo(
                    info.estudiante.correo,
                    "Confirmación de inscripción",
                    `<p>Se ha confirmado su inscripción.</p>
                    <p>Los datos son los siguientes:<p>
                    <ul>
                        <li><b>Evento:</b> ${info.evento.nombre}</li>
                        <li><b>Inicio:</b> ${horaInicio_texto}</li>
                        <li><b>Fin:</b> ${horaFin_texto}</li>
                    </ul>
                    <img src='${url}'/>`,
                    [
                        {
                            filename: "Confirmación.pdf",
                            content: pdfBytes,
                            contentType: "application/pdf",
                        },
                    ]
                );
            });

            return res.status(200).send({ mensaje: "Confirmado con éxito" });
        }
    });
});

/**
 * Método DELETE
 * Elimina una inscripción
 */
router.delete("/eliminar", (req, res) => {
    const { evento, carnet } = req.query;

    if (!estaAutenticado(req, true, true, carnet)) {
        return res.status(403).send({ mensaje: "Acceso denegado" });
    }

    const request = pool.request();

    try {
        if (evento) {
            request.input("IN_evento", sqlcon.UniqueIdentifier, evento);
        }

        if (carnet) {
            request.input("IN_carnet", sqlcon.Int, carnet);
        }
    } catch (error) {
        return res.status(400).send({ mensaje: "Datos inválidos" });
    }

    request.execute("AsociaTEC_SP_Inscripciones_Eliminar", (error, result) => {
        if (error) {
            manejarError(res, error);
        } else {
            return res.status(200).send({ mensaje: "Eliminado con éxito" });
        }
    });
});

module.exports = router;

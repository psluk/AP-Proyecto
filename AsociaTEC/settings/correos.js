const nodemailer = require("nodemailer");

const mail = "notificaciones.asociatec@gmail.com";

// Configuración del correo
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: mail,
        pass: "notificasocia",
    },
});

// Enviar correo
const enviarCorreo = async (destinatario, asunto, html, adjuntos) => {
    const mailOptions = {
        from: transporter.options.auth.user,
        to: destinatario,
        subject: asunto,
        html: html,
        attachments: adjuntos,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error enviando correo: ", error);
        } else {
            console.log("Correo enviado: ", info.response);
        }
    });
};

module.exports = { enviarCorreo };

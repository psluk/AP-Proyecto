const nodemailer = require("nodemailer");

const mail = "asociatec.notificaciones@gmail.com";
const firma = `<hr style="border: 1px solid #ccc; margin: 20px 0;" />
<img src="https://i.imgur.com/vLz5SDw.png" style="max-width: 250px" />`;

// Configuración del correo
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: mail,
        pass: "xzezctqbtpxdevfz",
    },
});

// Enviar correo
const enviarCorreo = async (
    destinatario = [],
    asunto,
    html,
    adjuntos = [],
    cco = []
) => {
    const mailOptions = {
        from: "Notificaciones AsociaTEC <" + mail + ">",
        to: destinatario,
        bcc: cco,
        subject: asunto,
        html: `<html>
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: Roboto, Arial, sans-serif;
                }
            </style>
        </head>
        <body>
            ${html}
            ${firma}
        </body>
        </html>`,
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

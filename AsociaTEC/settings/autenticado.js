const estaAutenticado = (req, admin = false, asociacion = false) => {
    const saved = req.session.user;

    return (
        saved &&
        ((!asociacion && !admin) ||
            (admin && saved.tipoUsuario == "Administrador") ||
            (asociacion && saved.tipoUsuario == "Asociación"))
    );
};

module.exports = estaAutenticado;
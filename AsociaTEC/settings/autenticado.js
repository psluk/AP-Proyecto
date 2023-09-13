const estaAutenticado = (
    req,
    admin = false,
    asociacion = false,
    carnet = null
) => {
    const saved = req.session.user;

    return (
        saved &&
        ((!asociacion && !admin) ||
            saved.tipoUsuario == "Administrador" ||
            (asociacion && saved.tipoUsuario == "Asociación") ||
            (carnet && saved.carnet == carnet))
    );
};

module.exports = estaAutenticado;

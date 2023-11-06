import { createContext, useState, useEffect, useContext } from "react";

const INITIAL_STATE = {
    currentUser: JSON.parse(localStorage.getItem("session")) || null,
};

export const SessionContext = createContext(INITIAL_STATE);

export function useSessionContext() {
    return useContext(SessionContext);
}

export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(INITIAL_STATE);

    useEffect(() => {
        localStorage.setItem("session", JSON.stringify(session.currentUser));
    }, [session.currentUser]);

    const getCorreo = () => {
        return session?.currentUser?.correo;
    };

    const getCarnet = () => {
        return session?.currentUser?.carnet;
    };

    const getTipoUsuario = () => {
        return session?.currentUser?.tipoUsuario;
    };

    const getCodigoCarrera = () => {
        return session?.currentUser?.codigoCarrera;
    };

    const getCodigoSede = () => {
        return session?.currentUser?.codigoSede;
    };

    const updateSession = (newSession) => {
        setSession(newSession);
        localStorage.setItem("session", JSON.stringify(newSession));
    };

    return (
        <SessionContext.Provider
            value={{
                session,
                setSession,
                getCorreo,
                getCarnet,
                getTipoUsuario,
                getCodigoCarrera,
                getCodigoSede,
                updateSession,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

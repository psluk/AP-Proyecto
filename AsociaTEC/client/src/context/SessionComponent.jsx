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

    const getEmail = () => {
        return session?.currentUser?.correo;
    };

    const getUniId = () => {
        return session?.currentUser?.carnet;
    };

    const getUserType = () => {
        return session?.currentUser?.tipoUsuario;
    };

    const getCareerCode = () => {
        return session?.currentUser?.codigoCarrera;
    };

    const getLocationCode = () => {
        return session?.currentUser?.codigoSede;
    };

    const getName = () => {
        return session?.currentUser?.nombre;
    };

    const isLoggedIn = () => {
        return session?.currentUser !== null;
    };

    return (
        <SessionContext.Provider
            value={{
                session,
                setSession,
                getEmail,
                getUniId,
                getUserType,
                getCareerCode,
                getLocationCode,
                getName,
                isLoggedIn,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

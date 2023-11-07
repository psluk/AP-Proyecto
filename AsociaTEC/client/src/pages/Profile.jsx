import { useNavigate } from "react-router-dom";
import { useSessionContext } from "../context/SessionComponent";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../utils/messageSettings";

const Profile = () => {
    const navigate = useNavigate();
    const {
        getEmail,
        getUniId,
        getUserType,
        getCareerCode,
        getCareerName,
        getLocationCode,
        getLocationName,
        getName,
        setSession,
    } = useSessionContext();

    const attemptLogout = () => {
        axios.post("/api/logout").then(() => {
            toast.success("Cierre de sesión exitoso", messageSettings);
            setSession({ currentUser: null });
            navigate("/");
        }).catch((err) => {
            axios.get("/api/login").then((res) => {
                if (res.data?.loggedIn === false) {
                    toast.success("Cierre de sesión exitoso", messageSettings);
                    setSession({ currentUser: null });
                    navigate("/");
                }
            }).catch((err2) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            });
        });
    }

    return (
        <div className="p-5 md:w-[30rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Perfil
            </h1>
            <ul className="flex flex-col space-y-2">
                { getName() ? <li><b>Nombre:</b> { getName() }</li> : <></> }
                { getUniId() ? <li><b>Carné:</b> { getUniId() }</li> : <></> }
                { getUserType() ? <li><b>Tipo de perfil:</b> { getUserType() }</li> : <></> }
                { getLocationCode() ? <li><b>Sede:</b> { getLocationName() + " (" + getLocationCode() + ")"}</li> : <></> }
                { getCareerCode() ? <li><b>Carrera:</b> { getCareerName() + " (" + getCareerCode() + ")" }</li> : <></> }
                { getEmail() ? <li><b>Correo electrónico:</b>{" "}
                    <a
                        className="text-venice-blue-700 hover:underline cursor-pointer"
                        href={`mailto:${getEmail()}`}>
                            { getEmail() }
                    </a></li> : <></> }
            </ul>
            <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg w-fit"
                type="button"
                key="logout"
                onClick={attemptLogout}
            >
                Cerrar sesión
            </button>
            {
                getUserType() !== "Administrador"
                ? <p className="mt-4 text-gray-600 text-center">
                    Para modificar su perfil, por favor, contacte a un administrador.
                </p>
                : <></>
            }
        </div>
    );
};

export default Profile;

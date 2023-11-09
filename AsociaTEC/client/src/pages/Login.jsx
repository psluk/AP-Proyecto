import FormItems from "../components/forms/FormItems";
import { LoginFields } from "../structures/LoginFields";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSessionContext } from "../context/SessionComponent";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../utils/messageSettings";
import { useEffect, useState } from "react";

const Login = () => {
    const navigate = useNavigate();
    const { session, setSession } = useSessionContext();
    const [data, setData] = useState({});

    useEffect(() => {
        // Redirect if logged in
        if (session.currentUser !== null) {
            navigate("/");
        }
    }, []);

    const attemptLogin = (e) => {
        e.preventDefault();
        
        axios.post("/api/login", {
            correo: data.email,
            clave: data.password,
        }, { withCredentials: true }).then((res) => {
            setSession({ currentUser: res.data });
            toast.success("Inicio de sesión exitoso", messageSettings);
            navigate("/");
        }).catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
        });
    };

    return (
        <div className="p-5 w-full xs:w-[30rem]">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Iniciar sesión
            </h1>
            <form className="space-y-4 flex flex-col items-center" onSubmit={attemptLogin}>
                <FormItems
                    fields={LoginFields}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <button
                    className="bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                    type="submit"
                    key="submit"
                >
                    Iniciar sesión
                </button>
            </form>
            <p className="mt-4 text-gray-600">
                ¿Aún no tiene cuenta?{" "}
                <a
                    className="text-venice-blue-700 hover:underline cursor-pointer"
                    href="/sign-up/student"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(e.target.getAttribute("href"));
                    }}
                >
                    Regístrese
                </a>{" "}
                ahora mismo.
            </p>
        </div>
    );
};

export default Login;

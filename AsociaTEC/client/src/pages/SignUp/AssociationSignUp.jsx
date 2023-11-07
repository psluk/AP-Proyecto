import FormItems from "../../components/forms/FormItems";
import { AssociationSignUpFields } from "../../structures/AssociationSignUpFields";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";

const AssociationSignUp = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        location: "",
        career: "",
    });
    const [fields, setFields] = useState(AssociationSignUpFields);
    const { session } = useSessionContext();

    useEffect(() => {
        // Redirect if logged in
        if (session.currentUser !== null) {
            navigate("/");
        }
    }, []);

    const saveLocations = (locations) => {
        if (locations.length === 0) {
            setData((prev) => ({
                ...prev,
                location: "",
            }));
            setFields((prev) => {
                const newFields = [...prev];
                newFields[2].options = [
                    {
                        value: "",
                        label: "Cargando...",
                        disabled: true,
                    },
                ];
                return newFields;
            });
            return;
        }
        setFields((prev) => {
            setData((prev) => ({
                ...prev,
                location: locations[0].codigo,
            }));
            const newFields = [...prev];
            newFields[2].options = locations.map((location) => ({
                label: location.nombre,
                value: location.codigo,
            }));
            return newFields;
        });
    };

    const saveCareers = (careers) => {
        if (careers.length === 0) {
            setData((prev) => ({
                ...prev,
                career: "",
            }));
            setFields((prev) => {
                const newFields = [...prev];
                newFields[3].options = [
                    {
                        value: "",
                        label: "Cargando...",
                        disabled: true,
                    },
                ];
                return newFields;
            });
            return;
        }
        setFields((prev) => {
            setData((prev) => ({
                ...prev,
                career: careers[0].codigo,
            }));
            const newFields = [...prev];
            newFields[3].options = careers.map((career) => ({
                label: career.nombre,
                value: career.codigo,
            }));
            return newFields;
        });
    };

    // Load locations
    useEffect(() => {
        document
            .getElementById("location")
            ?.classList.add("italic", "text-gray-400");
        document
            .getElementById("career")
            ?.classList.add("italic", "text-gray-400");

        axios.get("/api/sedes", { withCredentials: true }).then((res) => {
            saveLocations(res.data);
            document
                .getElementById("location")
                ?.classList.remove("italic", "text-gray-400");
        });
    }, []);

    useEffect(() => {
        // Load careers
        document
            .getElementById("career")
            ?.classList.add("italic", "text-gray-400");
        saveCareers([]);

        if (data.location) {
            axios
                .get(`/api/carreras?codigoSede=${data.location}`, {
                    withCredentials: true,
                })
                .then((res) => {
                    saveCareers(res.data);
                    document
                        .getElementById("career")
                        ?.classList.remove("italic", "text-gray-400");
                });
        }
    }, [data.location]);

    const attemptLogin = (e) => {
        e.preventDefault();

        axios
            .post(
                "/api/asociaciones/agregar",
                {
                    nombre: data.name,
                    descripcion: data.description,
                    telefono: data.phoneNumber,
                    codigoSede: data.location,
                    codigoCarrera: data.career,
                    correo: data.email,
                    clave: data.password,
                },
                { withCredentials: true }
            )
            .then((res) => {
                toast.success(
                    <p>
                        Registro exitoso
                        <br />
                        Ahora puede iniciar sesión
                    </p>,
                    messageSettings
                );
                navigate("/login");
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });
    };

    return (
        <div className="p-5 md:w-[30rem]">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Registrar asociación
            </h1>
            <form
                className="space-y-4 flex flex-col items-center"
                onSubmit={attemptLogin}
            >
                <FormItems
                    fields={fields}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <button
                    className="bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                    type="submit"
                    key={"submit"}
                >
                    Registrarse
                </button>
            </form>
            <p className="mt-4 text-gray-600">
                ¿Ya tiene cuenta?{" "}
                <a
                    className="text-venice-blue-700 hover:underline cursor-pointer"
                    href="/login"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(e.target.getAttribute("href"));
                    }}
                >
                    Inicie sesión
                </a>{" "}
                ahora mismo. O{" "}
                <a
                    className="text-venice-blue-700 hover:underline cursor-pointer"
                    href="/sign-up/student"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(e.target.getAttribute("href"));
                    }}
                >
                    regístrese como estudiante
                </a>
                .
            </p>
        </div>
    );
};

export default AssociationSignUp;

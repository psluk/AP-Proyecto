import React from 'react'
import FormItems from "../../components/forms/FormItems";
import { StudentSignUpFields } from "../../structures/Fields/StudentSignUpFields";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";

export const StudentSignUp = () => {

    const navigate = useNavigate();
    const [data, setData] = useState({
        codigoSede: "",
        codigoCarrera: "",
    });
    const [fields, setFields] = useState(StudentSignUpFields);
    const { session } = useSessionContext();

    useEffect(() => {
        // Redirect if logged in
        if (session.currentUser !== null) {
            navigate("/");
        }
    }, []);

    const saveLocations = (sedes) => {
        if (sedes.length === 0) {
            setData((prev) => ({
                ...prev,
                codigoSede: "",
            }));
            setFields((prev) => {
                const newFields = [...prev];
                newFields[4].options = [
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
                codigoSede: sedes[0].codigo,
            }));
            const newFields = [...prev];
            newFields[4].options = sedes.map((sede) => ({
                label: sede.nombre,
                value: sede.codigo,
            }));
            return newFields;
        });
    };

    const saveCareers = (carreras) => {
        if (carreras.length === 0) {
            setData((prev) => ({
                ...prev,
                codigoCarrera: "",
            }));
            setFields((prev) => {
                const newFields = [...prev];
                newFields[5].options = [
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
                codigoCarrera: carreras[0].codigo,
            }));
            const newFields = [...prev];
            newFields[5].options = carreras.map((carrera) => ({
                label: carrera.nombre,
                value: carrera.codigo,
            }));
            return newFields;
        });
    };

    // Load locations
    useEffect(() => {
        document
            .getElementById("codigoSede")
            ?.classList.add("italic", "text-gray-400");
        document
            .getElementById("codigoCarrera")
            ?.classList.add("italic", "text-gray-400");

        axios.get("/api/sedes", { withCredentials: true }).then((res) => {
            saveLocations(res.data);
            document
                .getElementById("codigoSede")
                ?.classList.remove("italic", "text-gray-400");
        });
    }, []);

    useEffect(() => {
        // Load careers
        document
            .getElementById("codigoCarrera")
            ?.classList.add("italic", "text-gray-400");
        saveCareers([]);

        if (data.codigoSede) {
            axios
                .get(`/api/carreras?codigoSede=${data.codigoSede}`, {
                    withCredentials: true,
                })
                .then((res) => {
                    saveCareers(res.data);
                    document
                        .getElementById("codigoCarrera")
                        ?.classList.remove("italic", "text-gray-400");
                });
        }
    }, [data.codigoSede]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post("/api/estudiantes/agregar", data, { withCredentials: true })
        .then((res) => {
            toast.success("¡Registrado exitosamente!", messageSettings);
            navigate("/login");
        })
        .catch((err) => {
            toast.error(
                err?.response?.data?.mensaje || defaultError,
                messageSettings
            );
        });
    }
    return (
        <div className="p-5 w-full xs:w-[30rem]">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Registrar estudiante
            </h1>
            <form
                onSubmit={handleSubmit}
                className="space-y-4 flex flex-col items-center"
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
                    href="/sign-up/association"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(e.target.getAttribute("href"));
                    }}
                >
                    regístrese como asociación
                </a>
                .
            </p>
        </div>
    )
}

export default StudentSignUp
import FormItems from "../../components/forms/FormItems";
import { StudentSignUpFields } from "../../structures/Fields/StudentSignUpFields";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

const Student = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        codigoSede: "",
        codigoCarrera: "",
    });
    const [fields, setFields] = useState(() => {
        const newFields = StudentSignUpFields;
        newFields[7].placeholder = "Dejar en blanco para no cambiar la contraseña";
        newFields[7].required = false;
        return newFields;
    });
    const { uniId } = useParams();
    const [locationsLoaded, setLocationsLoaded] = useState(false);
    const [careersLoaded, setCareersLoaded] = useState(false);
    const [studentLoaded, setStudentLoaded] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const saveLocations = (locations) => {
        if (locations.length === 0) {
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
            const newFields = [...prev];
            newFields[4].options = locations.map((location) => ({
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
            if (initialLoad) {
                setInitialLoad(false);
            } else {
                setData((prev) => ({
                    ...prev,
                    codigoCarrera: careers[0].codigo,
                }));
            }
            const newFields = [...prev];
            newFields[5].options = careers.map((career) => ({
                label: career.nombre,
                value: career.codigo,
            }));
            return newFields;
        });
    };

    // Load locations and association data
    useEffect(() => {
        document
            .getElementById("location")
            ?.classList.add("italic", "text-gray-400");
        document
            .getElementById("career")
            ?.classList.add("italic", "text-gray-400");

        axios.get("/api/sedes", { withCredentials: true }).then((res) => {
            saveLocations(res.data);
            setLocationsLoaded(true);
            document
                .getElementById("location")
                ?.classList.remove("italic", "text-gray-400");
        });

        axios
            .get(`/api/estudiantes/detalles?carnet=${uniId}`, {
                withCredentials: true,
            })
            .then((res) => {
                const result = res.data[0];
                setData((prev) => ({
                    ...prev,
                    carnet: result?.carnet,
                    nombre: result?.nombre,
                    apellido1: result?.apellido1,
                    apellido2: result?.apellido2,
                    codigoCarrera: result?.carrera?.codigo,
                    codigoSede: result?.sede?.codigo,
                    correo: result?.correo,
                }));
                setStudentLoaded(true);
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });

    }, []);

    useEffect(() => {
        // Load careers
        document
            .getElementById("career")
            ?.classList.add("italic", "text-gray-400");
        saveCareers([]);

        if (data.codigoSede) {
            axios
                .get(`/api/carreras?codigoSede=${data.codigoSede}`, {
                    withCredentials: true,
                })
                .then((res) => {
                    saveCareers(res.data);
                    setCareersLoaded(true);
                    document
                        .getElementById("career")
                        ?.classList.remove("italic", "text-gray-400");
                });
        }
    }, [data.codigoSede]);

    const attemptModify = (e) => {
        e.preventDefault();

        axios
            .put(
                "/api/estudiantes/modificar",
                {
                    carnet: uniId,
                    carnetNuevo: data.carnet,
                    nombre: data.nombre,
                    apellido1: data.apellido1,
                    apellido2: data.apellido2,
                    codigoSede: data.codigoSede,
                    codigoCarrera: data.codigoCarrera,
                    clave: data.clave,
                    correo: data.correo,
                },
                { withCredentials: true }
            )
            .then((res) => {
                toast.success(
                    <p>
                        Estudiante modificado exitosamente
                    </p>,
                    messageSettings
                );
                navigate(`/student/edit/${data.carnet}`);
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });
    };

    return (
        <div className="p-5 w-full sm:w-[40rem] flex flex-col">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Editar estudiante
            </h1>
            {
                studentLoaded && locationsLoaded && careersLoaded
                ? <>
                    <form
                        className="space-y-4 flex flex-col items-center"
                        onSubmit={attemptModify}
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
                            Guardar cambios
                        </button>
                    </form>
                    <p className="text-center mt-4">
                        <a
                            className="text-venice-blue-700 hover:underline cursor-pointer"
                            href="/students"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate("/students");
                            }}
                        >
                            Cancelar
                        </a>
                    </p>
                </>
                : <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles"/>
            }
        </div>
    );
};

export default Student;
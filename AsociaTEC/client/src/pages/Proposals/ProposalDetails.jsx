import FormItems from "../../components/forms/FormItems";
import { AssociationSignUpFields } from "../../structures/Fields/AssociationSignUpFields";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";

const ProposalDetails = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        location: "",
        career: "",
    });
    const [fields, setFields] = useState(() => {
        const newFields = AssociationSignUpFields;
        newFields[6].placeholder = "Dejar en blanco para no cambiar la contraseña";
        newFields[6].required = false;
        return newFields;
    });
    const { session } = useSessionContext();
    const { locationCode, careerCode } = useParams();
    const [locationsLoaded, setLocationsLoaded] = useState(false);
    const [careersLoaded, setCareersLoaded] = useState(false);
    const [email, setEmail] = useState("");
    const [initialLoad, setInitialLoad] = useState(true);

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
            if (initialLoad) {
                setInitialLoad(false);
            } else {
                setData((prev) => ({
                    ...prev,
                    career: careers[0].codigo,
                }));
            }
            const newFields = [...prev];
            newFields[3].options = careers.map((career) => ({
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
            .get(`/api/asociaciones/detalles?sede=${locationCode}&carrera=${careerCode}`, {
                withCredentials: true,
            })
            .then((res) => {
                const result = res.data[0];
                setEmail(result?.asociacion?.correo);
                setData((prev) => ({
                    ...prev,
                    name: result?.asociacion?.nombre,
                    description: result?.asociacion?.descripcion,
                    phoneNumber: result?.asociacion?.telefono,
                    location: result?.sede?.codigo,
                    career: result?.carrera?.codigo,
                    email: result?.asociacion?.correo,
                    password: "",
                }));
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

        if (data.location) {
            axios
                .get(`/api/carreras?codigoSede=${data.location}`, {
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
    }, [data.location]);

    const attemptModify = (e) => {
        e.preventDefault();

        axios
            .put(
                "/api/asociaciones/modificar",
                {
                    nombreNueva: data.name,
                    descripcionNueva: data.description,
                    telefonoNueva: data.phoneNumber,
                    codigoSedeNueva: data.location,
                    codigoCarreraNueva: data.career,
                    correoNueva: data.email,
                    claveNueva: data.password,
                    correoActual: email,
                },
                { withCredentials: true }
            )
            .then((res) => {
                toast.success(
                    <p>
                        Asociación modificada exitosamente
                    </p>,
                    messageSettings
                );
                navigate(`/edit/association/${data.location}/${data.career}`);
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });
    };

    return (
        <div className="p-5 w-full sm:w-[40rem]">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Detalles De La Propuestas
            </h1>
            {
                email && locationsLoaded && careersLoaded
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
                            href="/associations"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(-1);
                            }}
                        >
                            Cancelar
                        </a>
                    </p>
                </>
                : <p className="text-gray-600 italic text-center">Cargando...</p>
            }
        </div>
    );
};

export default ProposalDetails;

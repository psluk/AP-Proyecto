import FormItems from "../../components/forms/FormItems";
import { LoginFields } from "../../structures/LoginFields";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSessionContext } from "../../context/SessionComponent";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useEffect, useState } from "react";
import { ProposalStructure } from "../../structures/CreateProposalFields";

const Proposal = () => {
    const navigate = useNavigate();
    const { getEmail, isLoggedIn, getUniId, getCareerCode, getLocationCode } =
        useSessionContext();
    const [associations, setAssociations] = useState([]);
    const [fields, setFields] = useState(ProposalStructure);
    const [data, setData] = useState({});
    const [fulldata, setFulldata] = useState({});

    useEffect(() => {
        // Redirect if not logged in
        if (!isLoggedIn) {
            navigate("/login");
            toast.error("Sesión no iniciada", messageSettings);
        }

        setFulldata((prev) => ({
            ...prev,
            carnet: getUniId,
        }));

        axios
            .get("/api/asociaciones", { withCredentials: true })
            .then((res) => {
                console.log(res.data);
                setAssociations(res.data);
                if (res.data.length > 0) {
                    setFields((prev) => {
                        setFulldata((prev) => ({
                            ...prev,
                            codigoCarrera: res.data[0].carrera.codigo,
                            codigoSede: res.data[0].sede.codigo,
                        }));
                        const newFields = [...prev];
                        newFields[0].options = res.data.map((item) => ({
                            label: item.asociacion.nombre,
                            value: `${item.sede.codigo}/${item.carrera.codigo}`,
                        }));
                        return newFields;
                    });
                }
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });
    }, []);

    useEffect(() => {
        if (data.asociacion) {
            const stringArray = data.asociacion.split("/");

            setFulldata((data) => ({
                ...data,
                codigoCarrera: stringArray[1],
                codigoSede: stringArray[0],
            }));
        }
    }, [data]);

    const handleSumit = (e) => {
        e.preventDefault();

        if (typeof fulldata.carnet === "string") {
            const theBody = {
                ...fulldata,
                titulo: data.titulo,
                tematica: data.tematica,
                objetivos: data.objetivos,
                actividades: data.actividades,
                otros: data.otros,
            };
            console.log(theBody);
            axios
                .post("/api/propuestas/agregar", theBody, {
                    withCredentials: true,
                })
                .then((res) => {
                    toast.success(
                        "Propuesta creada con éxito",
                        messageSettings
                    );
                    navigate("/");
                })
                .catch((err) => {
                    toast.error(
                        err?.response?.data?.mensaje || defaultError,
                        messageSettings
                    );
                });
        } else {
            toast.error("Debe iniciar sessión", messageSettings);
        }
    };

    return (
        <div className="p-5 w-full xs:w-[30rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Nueva propuesta
            </h1>
            <p>
                A continuación, podrá hacer una propuesta a la asociación
                de su preferencia
            </p>

            <form className="space-y-4 flex flex-col items-center w-full" onSubmit={handleSumit}>
                <FormItems
                    fields={fields}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <button
                    className=" bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                    type="submit"
                    key={"submit"}
                >
                    Proponer
                </button>
            </form>
            <a
                className="text-venice-blue-700 hover:underline cursor-pointer"
                href="/events"
                onClick={(e) => {
                    e.preventDefault();
                    navigate(-1);
                }}
            >
                Cancelar
            </a>
        </div>
    );
};

export default Proposal;

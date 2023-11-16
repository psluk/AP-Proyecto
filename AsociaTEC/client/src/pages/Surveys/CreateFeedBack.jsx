import { useNavigate, useParams } from "react-router-dom";
import FormItems from "../../components/forms/FormItems";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import Forum from "../../components/cards/Forum";
import { CreateSurvey } from "../../structures/Fields/CreateSurvey";
import { Stars } from "../../structures/Fields/Stars";

const CreateFeedBack = () => {
    const navigate = useNavigate();
    const { getUserType, isLoggedIn, getUniId } = useSessionContext();
    const [constFields, setConstFields] = useState(CreateSurvey);
    const [constStars, setConstStars] = useState(Stars);
    const [fields, setFields] = useState([]);
    const [event, setEvent] = useState(false);
    const { uuid } = useParams();
    const [data, setData] = useState({});


    const handleCreate = (e) => {
        e.preventDefault();

        if (!isLoggedIn()) {
            navigate("/login");
            toast.error("Sesión no iniciada", messageSettings);
            return
        } 

        if (data.comentario === undefined || data.comentario.trim() === "" ) {
            toast.error("Comentario vacio",messageSettings);
            return;
        }

        axios.post('/api/encuestas/agregar',
            {
                evento: uuid,
                carnet: getUniId(),
                calificacion: data.calificacion,
                comentario: data.comentario
            },
            { withCredentials: true }).then((res) => {
                toast.success("Retroalimentación enviada exitosamente", messageSettings);
                navigate(`/my-events`);//falta de donde viene
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });
    }

    // Load locations and association data
    useEffect(() => {

        if (!isLoggedIn()) {
            navigate("/login");
            toast.error("Sesión no iniciada", messageSettings);
        }

        setFields(() => {
            setData((prev) => ({
                ...prev,
                calificacion: 5
            }));
            const newFields = [...constFields];
            newFields[0].options = constStars.map((item) => ({
                label: item.label,
                value: item.value,
            }));
            return newFields;
        });

        axios.get(`/api/eventos/detalles?uuid=${uuid}`,{ withCredentials: true }).then((res) => {

            setEvent(true)

            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
                setEvent(false)
            });
    }, []);

    console.log("data", data)
    return (
        event? 
        <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Retroalimentación
            </h1>
            <form className="space-y-4 flex flex-col items-center w-full" onSubmit={handleCreate}>
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
                    Enviar
                </button>
            </form>
        </div>
        :
        <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Evento no existente
            </h1>
        </div>
        
    );
};

export default CreateFeedBack;
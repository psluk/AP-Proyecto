import FormItems from "../../components/forms/FormItems";
import { CreateEventActivityFields } from "../../structures/Fields/CreateEventActivityFields";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { localHtmlAttribute, localDateTime, isoString } from "../../utils/dateFormatter";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

const EditActivity = () => {
    const navigate = useNavigate();
    const { e_uuid, a_uuid } = useParams();
    const [data, setData] = useState({});
    const [event, setEvent] = useState(null);
    const [fields, setFields] = useState(CreateEventActivityFields);

    const attemptModify = (e) => {
        e.preventDefault();

        if (data.startDate >= data.endDate) {
            toast.error(
                "La fecha de inicio debe ser anterior a la fecha de finalización",
                messageSettings
            );
            return;
        };

        axios.put('/api/actividades/modificar',
            {
                uuid: a_uuid,
                nombre: data.name,
                lugar: data.place,
                fechaInicio: isoString(data.startDate),
                fechaFin: isoString(data.endDate),
            }, { withCredentials: true }).then((res) => {
            toast.success(
                <p>
                    Actividad modificada exitosamente
                </p>,
                messageSettings
            );
            navigate(`/event/activities/${e_uuid}`);
        }).catch((err) => {
            toast.error(
                err?.response?.data?.mensaje || defaultError,
                messageSettings
            );
        });
    }

    // Loads event data
    useEffect(() => {
        axios.get(`/api/actividades/detalles?uuid=${a_uuid}`, { withCredentials: true }).then((res) => {
            const loadedEvent = res.data[0];
            console.log(loadedEvent)
            setEvent(loadedEvent);
            setData((prev) => ({
                ...prev,
                uuid: a_uuid,
                nombre: loadedEvent.Nombre,
                lugar: loadedEvent.lugar,
                startDate: localHtmlAttribute(loadedEvent.fechaInicio),
                endDate: localHtmlAttribute(loadedEvent.fechaFin),
            }));
            setFields((prev) => {
                const newFields = [...prev];
                newFields[2].min = localHtmlAttribute(loadedEvent?.fechaInicio);
                newFields[2].max = localHtmlAttribute(loadedEvent?.fechaFin);
                newFields[3].min = localHtmlAttribute(loadedEvent?.fechaInicio);
                newFields[3].max = localHtmlAttribute(loadedEvent?.fechaFin);
                return newFields;
            });

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
        });
    }, []);
    console.log("data",data)
    return (
        <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Editar actividad
            </h1>
            {
                event
                ? <>
                <div className="w-full border p-3 shadow-md rounded-xl">
                    <h2 className="text-xl font-serif font-bold text-venice-blue-700">Información de la actividad</h2>
                    <ul className="px-4">
                        <li className="flex flex-col mb-2"><p className="font-bold">Nombre</p><p className="pl-4">{event?.Nombre}</p></li>
                        <li className="flex flex-col mb-2"><p className="font-bold">Lugar</p><p className="pl-4">{event?.lugar}</p></li>
                        <li className="flex flex-col mb-2"><p className="font-bold">Fecha de inicio</p><p className="pl-4">{localDateTime(event?.fechaInicio, 'full', 'short')}</p></li>
                        <li className="flex flex-col"><p className="font-bold">Fecha de finalización</p><p className="pl-4">{localDateTime(event?.fechaFin, 'full', 'short')}</p></li>
                    </ul>
                </div>
                <form className="space-y-4 flex flex-col items-center w-full" onSubmit={attemptModify}>
                    <FormItems
                        fields={fields}
                        formItemsData={data}
                        setFormItemsData={setData}
                    />
                    <button
                        className="bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                        type="submit"
                        key="submit"
                    >
                        modificar actividad
                    </button>
                </form>
                <p className="text-center mt-4">
                    <a
                        className="text-venice-blue-700 hover:underline cursor-pointer"
                        href={`/event/${e_uuid}`}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(-1);
                        }}
                    >
                        Cancelar
                    </a>
                </p>
            </>
            : <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles"/>
            }
        </div>
    )
};

export default EditActivity;
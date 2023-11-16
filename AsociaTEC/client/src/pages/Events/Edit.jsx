import React from 'react'
import FormItems from '../../components/forms/FormItems'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { EditEventStructure } from '../../structures/Fields/EditEventFields'
import { useSessionContext } from "../../context/SessionComponent";
import { useNavigate, useParams } from "react-router-dom";
import { isoString, currentLocalHtmlAttribute, localHtmlAttribute } from '../../utils/dateFormatter'
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

export default function EditEvent() {
    const navigate = useNavigate();
    const [data, setData] = useState({ categoria: "" });
    const { uuid } = useParams();
    const [fields, setFields] = useState(EditEventStructure);
    const [event, setEvent] = useState(null);
    const [categories, setCategories] = useState([]);
    const { session } = useSessionContext();

    const handleActivity = (e) => {
        e.preventDefault()
        navigate(`/event/activities/${event?.asociacion}/${uuid}`)
    };

    const handleCollaborator = (e) => {
        e.preventDefault()
        navigate(`/collaborators/${uuid}`)
    };

    const handleFeedback = (e) => {
        e.preventDefault()
        navigate(`/feedbacks/${uuid}`)
    };
    

    useEffect(() => {
        // Redirect if logged in
        if (session.currentUser === null) {
            navigate("/");
        }
    }, []);


    useEffect(() => {
        axios.get(`/api/eventos/detalles/?uuid=${uuid}`, { withCredentials: true }).then((res) => {

            setEvent(res.data[0])

            if (res.data.length > 0) {
                setData((prev) => ({
                    ...prev,
                    titulo: res.data[0].titulo,
                    capacidad: res.data[0].capacidad,
                    lugar: res.data[0].lugar,
                    fechaInicio: localHtmlAttribute(res.data[0].fechaInicio),
                    fechaFin: localHtmlAttribute(res.data[0].fechaFin),
                    categoria: res.data[0].categoria,
                    descripcion: res.data[0].descripcion,
                    especiales: res.data[0].especiales,
                }));
                setFields(() => {
                    const newFields = [...fields];
                    newFields[0].placeholder = res.data[0].titulo
                    newFields[1].placeholder = res.data[0].capacidad
                    newFields[2].placeholder = res.data[0].lugar
                    newFields[3].placeholder = localHtmlAttribute(res.data[0].fechaInicio)
                    newFields[3].min = currentLocalHtmlAttribute();
                    newFields[4].placeholder = localHtmlAttribute(res.data[0].fechaFin)
                    newFields[4].min = currentLocalHtmlAttribute();
                    newFields[5].value = res.data[0].capacidad
                    newFields[6].placeholder = res.data[0].descripcion
                    newFields[7].placeholder = res.data[0].especiales
                    return newFields;
                });
            }

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
        });

        axios.get("/api/eventos/categorias", { withCredentials: true }).then((res) => {
            //registro de datos del evento
            setFields((prev) => {
                const newFields = [...prev];
                newFields[5].options = res.data.map((item) => ({
                    label: item.categoria,
                    value: item.categoria,
                }));
                return newFields;
            });

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
        });

    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("data", data)

        if (data.fechaInicio >= data.fechaFin) {
            toast.error(
                "La fecha de inicio debe ser anterior a la fecha de finalización",
                messageSettings
            );
            return;
        };

        const x = {
            ...data,
            fechaInicio: isoString(data.fechaInicio),
            fechaFin: isoString(data.fechaFin),
            uuid
        }

        axios.put('/api/eventos/modificar', x, { withCredentials: true }).then((res) => {

            toast.success("Evento modificado con éxito", messageSettings);
            navigate("/events");
        })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });
    };

    return (
        <div className='p-3 lg:w-[64rem] md:flex md:flex-col md:items-center w-full'>
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold my-4">
                Editar evento
            </h1>
            {
                event
                ?
                <>
                    <div className="flex flex-row flex-wrap gap-x-3 md:gap-x-5 lg:gap-x-10 gap-y-3 justify-center">
                    <button
                        className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                        onClick={handleActivity}
                    >
                        Actividades
                    </button>
                    <button
                        className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                        onClick={handleCollaborator}
                    >
                        Colaboradores
                    </button>
                    <button
                        className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                        onClick={handleFeedback}
                    >
                        Retroalimentación
                    </button>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-4xl md:grid md:grid-cols-2 gap-x-10 gap-y-3 md:mt-4 px-6">
                        <FormItems
                            fields={fields}
                            formItemsData={data}
                            setFormItemsData={setData}
                        />
                        <div className='col-span-2 flex flex-col items-center'>
                            <button
                                className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit bg-center"
                                type="submit"
                                key="submit"
                            >
                                Editar evento
                            </button>
                        </div>
                    </form>

                    <p className="text-center mt-4">
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
                    </p>
                </>
                :
                <div className="flex flex-col">
                    <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles"/>
                </div>
            }
        </div>
    )
}

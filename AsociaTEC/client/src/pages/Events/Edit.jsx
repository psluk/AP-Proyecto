import React from 'react'
import FormItems from '../../components/forms/FormItems'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { EditEventStructure } from '../../structures/Fields/EditEventFields'
import { useSessionContext } from "../../context/SessionComponent";
import { useNavigate, useParams } from "react-router-dom";
import { isoString, currentLocalHtmlAttribute } from '../../utils/dateFormatter'

export default function EditEvent() {
    const navigate = useNavigate();
    const [data, setData] = useState({ categoria: "" });
    const { uuid } = useParams();
    const [constFields, setConstFields] = useState(EditEventStructure);
    const [fields, setFields] = useState([]);
    const [event, setEvent] = useState([]);
    const [categories, setCategories] = useState([]);
    const [count, setCount] = useState(0);
    const { session } = useSessionContext();


    const handleActivity = (e) => {
        e.preventDefault()
        navigate(`/event/activities/${uuid}`)
    };

    const handleCollaborator = (e) => {
        e.preventDefault()
        navigate(`/collaborators/${uuid}`)
    };


    useEffect(() => {
        // Redirect if logged in
        if (session.currentUser === null) {
            console.log("raro")
            navigate("/");
        }
    }, []);


    useEffect(() => {
        // fields ya tiene valores

        axios.get(`/api/eventos/detalles/?uuid=${uuid}`, { withCredentials: true }).then((res) => {
            //registro de datos del evento

            setEvent(res.data)

            if (res.data.length > 0) {
                setFields(() => {
                    setData((prev) => ({
                        ...prev,
                        titulo: res.data[0].titulo,
                        capacidad: res.data[0].capacidad,
                        lugar: res.data[0].lugar,
                        fechaInicio: res.data[0].fechaInicio,
                        fechaFin: res.data[0].fechaFin,
                        categoria: res.data[0].categoria,
                        descripcion: res.data[0].descripcion,
                        especiales: res.data[0].especiales,

                    }));
                    const newFields = [...constFields];
                    newFields[0].placeholder = res.data[0].titulo
                    newFields[1].placeholder = res.data[0].capacidad
                    newFields[2].placeholder = res.data[0].lugar
                    newFields[3].placeholder = res.data[0].fechaInicio
                    newFields[4].placeholder = res.data[0].fechaFin
                    newFields[5].options = res.data.map((item) => ({
                        label: item.categoria,
                        value: item.categoria,
                    }));
                    newFields[6].placeholder = res.data[0].descripcion
                    newFields[7].placeholder = res.data[0].especiales
                    return newFields;
                });
            }
            //followUP()
            setCount(count + 1)

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            console.log("even")
        });

        axios.get("/api/eventos/categorias", { withCredentials: true }).then((res) => {
            //registro de datos del evento
            setCategories(res.data);
            setCount(count + 1)

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            console.log("cate")
        });

    }, [constFields]);

    useEffect(() => {

        if (fields !== undefined && categories !== undefined && count === 2) {
            setFields((prev) => {

                const newFields = [...prev];
                const aux = categories.map((item) => ({
                    label: item.categoria,
                    value: item.categoria,
                }));
                const sett = new Set([...newFields[5].options.map((opt) => opt.value), ...aux.map((opt) => opt.value)])
                var temp = []

                sett.forEach((item) => {

                    temp = [...temp, aux.find((val) => val.value === item)]
                });

                newFields[5].options = temp

                console.log("options", newFields[5].options)

                return newFields;
            });
            setCount(0)
        }

    }, [fields, categories]);





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
            uuid: uuid
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
                Editar Evento
            </h1>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 p-6 ">
                <button
                    className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                    onClick={handleActivity}
                >
                    Ver actividades
                </button>


                <button
                    className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                    onClick={handleCollaborator}
                >
                    Ver colaboradores
                </button>
            </div>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl md:mt-4 p-6 ">
                <div className='md:grid md:grid-cols-2 md:gap-10 space-y-4 md:space-y-0'>
                    <FormItems
                        fields={fields}
                        formItemsData={data}
                        setFormItemsData={setData}
                    />
                </div>
                <div className='w-full flex justify-center mt-12'>
                    <button
                        className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit bg-center"
                        type="submit"
                        key="submit"
                    >
                        Editar evento
                    </button>
                </div>
            </form>

            <p className="text-center">
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
        </div>
    )
}

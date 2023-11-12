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
    const [fields, setFields] = useState(EditEventStructure);
    const [event, setEvent] = useState([]);
    const [cambio, setCambio] = useState(false);
    const [activities, setActivities] = useState([]);
    const {session } = useSessionContext();


    const handleActivity = (e) => {
        e.preventDefault()
        navigate(`/event/activities/${uuid}`)
    };

    useEffect(() => {
        // Redirect if logged in
        if (session.currentUser === null) {
            console.log("raro")
            navigate("/");
        }

        axios.get(`/api/eventos/detalles/?uuid=${uuid}`, { withCredentials: true }).then((res) => {
            //registro de datos del evento
            console.log("event", res.data)
            setEvent(res.data)
            if (res.data.length > 0) {
                setFields((prev) => {
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
                    const newFields = [...prev];
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
            setCambio(true)

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            console.log("even")
        });

        axios.get("/api/eventos/categorias", { withCredentials: true }).then((res) => {
            //registro de datos del evento
            setTimeout(() => {
                if (res.data.length > 0) {
                    setFields((prev) => {
    
                        const newFields = [...prev];
                        const aux = res.data.map((item) => ({
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
                }
                setCambio(true)
              }, 500);

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            console.log("cate")
        });
        setCambio(true)

        /*
        verificacion de loggin [ya]

        solicitud a la api  (el evento) [ya]

        mapeamos todos los valores a evento y data [ya]
        llamamos a actualizar fields [ya]

        on sumit, hacemos push a la api los valores
        en logro:
            actualizamos los valores en new evento y evento
            llamamos a actualizar fields
            mostramos mensaje
        en fallo:
            mostramos mensaje
        */

        /*
        actualizacion de actividad: al ser en otra pagina, al regresar a esta lo de arriba se repite

        */

    }, []);


    useEffect(() => {

        axios.get("/api/eventos/categorias", { withCredentials: true }).then((res) => {
            //registro de datos del evento
            if (res.data.length > 0) {
                setFields((prev) => {

                    const newFields = [...prev];
                    const aux = res.data.map((item) => ({
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
            }

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            console.log("cate")
        });


    }, [cambio]);


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

        console.log("hhh",x)
        /*
        titulo = req.body.titulo;
        descripcion = req.body.descripcion;
        fechaInicio = req.body.fechaInicio;
        fechaFin = req.body.fechaFin;
        lugar = req.body.lugar;
        especiales = req.body.especiales;
        capacidad = req.body.capacidad;
        categoria = req.body.categoria;
        uuid = req.body.uuid;
        */

        //falta configurar el axios
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

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl md:grid md:grid-cols-2 md:gap-10 md:mt-4 p-6 space-y-4 md:space-y-0">
                <FormItems
                    fields={fields}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <div className=' flex space-x-4'>
                    <button
                        className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                        onClick={handleActivity}
                    >
                        ver actividades
                    </button>
                </div>
                <button
                    className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit bg-center"
                    type="submit"
                >
                    Editar evento
                </button>
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

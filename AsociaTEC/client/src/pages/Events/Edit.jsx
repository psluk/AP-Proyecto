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

/*
const titulo = req.body.titulo;
    const descripcion = req.body.descripcion;
    const fechaInicio = req.body.fechaInicio;
    const fechaFin = req.body.fechaFin;
    const lugar = req.body.lugar;
    const especiales = req.body.especiales;
    const capacidad = req.body.capacidad;
    const categoria = req.body.categoria;
    const uuid = req.body.uuid;


del form:
    titulo
    capacidad
    lugar
    fechaInicio
    fechaFin
    categoria
    descripcion
    especiales
    actividades

*/

export default function EditEvent() {
    const navigate = useNavigate();
    const [data, setData] = useState({ categoria: "" });
    const { uuid } = useParams();
    const [fields, setFields] = useState(EditEventStructure);
    const [event, setEvent] = useState([]);
    const [activities, setActivities] = useState([]);
    const { getCareerCode, getLocationCode, session } = useSessionContext();


    const handleEditActivity = (e) => {
        e.preventDefault()
        // falta
        // verificar existencia de uuid
        // navegar a editar actividad

    };
    const handleCreateActivity = (e) => {
        e.preventDefault()
        // falta
        // navegar a crear actividad


    };

    useEffect(() => {
        // Redirect if logged in
        if (session.currentUser === null) {
            navigate("/");
        }

        axios.get(`/api/actividades/?uuid=${uuid}`, { withCredentials: true }).then((res) => {
            //registro de datos de las actividades del evento
            console.log("actividades", res.data)
            setActivities(res.data) // guardamos las actividades
            if (res.data.length > 0) {
                setFields((prev) => {
                    setData((prev) => ({
                        ...prev,
                        actividades: res.data[0].uuid
                    }));
                    const newactivities = [...prev];
                    newactivities[8].options = res.data.map((item) => ({
                        label: item.nombre,
                        value: `${item.uuid}`,
                    }));
                    return newactivities;
                });
            }

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            console.log("act")
        });

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

        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            console.log("even")
        });

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
        
        //falta configurar el axios
        axios.post('/api/eventos/agregar', {
            ...data,
            fechaInicio: isoString(data.fechaInicio),
            fechaFin: isoString(data.fechaFin)
        }, { withCredentials: true }).then((res) => {
            toast.success(
                <p>
                    Evento creado exitosamente
                </p>,
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
        toast.success("Evento creado con éxito", messageSettings);
        navigate("/eventos");
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
                        onClick={handleEditActivity}
                    >
                        Editar la actividad
                    </button>
                    <button
                        className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                        onClick={handleCreateActivity}
                    >
                        Agregar actividad
                    </button>
                </div>
            </form>
            <button
                className="bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                type="submit"
            >
                Editar evento
            </button>

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

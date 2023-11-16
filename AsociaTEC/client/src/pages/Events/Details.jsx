import React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { localDateTime } from '../../utils/dateFormatter'
import { useNavigate } from 'react-router-dom'
import { useSessionContext } from "../../context/SessionComponent";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faWhatsapp, faXTwitter} from '@fortawesome/free-brands-svg-icons'

const EventDetails = () => {
    const currentURL = window.location.href;
    const { uuid } = useParams()
    const [event, setEvent] = useState(null)
    const navigate = useNavigate()
    const { getUserType, getUniId } = useSessionContext()
    const student = getUserType() === "Estudiante"
    const [isLoading, setIsLoading] = useState(true);
    
    const goToActivities = (e) => {
        e.preventDefault()
        navigate(`/event/activities/${event.asociacion}/${uuid}`)

    }

    const requestCollaboration = (e) => {
        e.preventDefault()
        axios.post(`/api/colaboradores/solicitudes/agregar`, { carnet: getUniId(), uuid: uuid }, { withCredentials: true })
            .then((res) => {
                toast.success("Solicitud enviada con éxito", messageSettings)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings)
            })
    }

    const register = (e) => {
        e.preventDefault()
        axios.post(`/api/inscripciones/agregar`, { carnet: getUniId(), evento: uuid }, { withCredentials: true })
            .then((res) => {
                toast.success("Inscripción realizada con éxito", messageSettings)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings)
            })
    }

    const interest = (e) => {
        e.preventDefault()
        axios.post(`/api/interes/agregar`, { carnet: getUniId(), evento: uuid }, { withCredentials: true })
            .then((res) => {
                toast.success("Evento marcado como interés", messageSettings)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings)
            })

    }
    useEffect(() => {
        axios.get(`/api/eventos/detalles?uuid=${uuid}`, { withCredentials: true })
            .then((res) => {
                setEvent(res.data[0])
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings)
            })
    }, [])

    const share = (e) => {
        axios.put(`/api/eventos/compartir?`,{uuid})
            .then((res) => {
                toast.success("Compartido", messageSettings)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings)
            })
    }


    return (
        <div className="p-3 lg:w-[64rem] md:flex md:flex-col md:items-center w-full">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold my-6">Detalles del evento</h1>
            {event ?
                <>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-8'>
                        <div className="flex flex-col"><p><span className='font-bold'>Título del evento: </span></p><p>{event.titulo}</p></div>
                        <div className="flex flex-col"><p><span className='font-bold'>Asociación: </span></p><p>{event.asociacion}</p></div>
                        <div className="flex flex-col"><p><span className='font-bold'>Fecha de inicio: </span></p><p> {localDateTime(event.fechaInicio, "full")}</p></div>
                        <div className="flex flex-col"><p><span className='font-bold'>Fecha de finalización: </span></p><p>{localDateTime(event.fechaFin, "full")}</p></div>
                        <div className="flex flex-col"><p><span className='font-bold'>Descripción: </span></p><p>{event.descripcion}</p></div>
                        <div className="flex flex-col"><p><span className='font-bold'>Ubicación: </span></p><p>{event.lugar}</p></div>
                        <div className="flex flex-col"><p><span className='font-bold'>Capacidad: </span></p><p>{event.capacidad}</p></div>
                        <div className="flex flex-col"><p><span className='font-bold'>Categoría: </span></p><p>{event.categoria}</p></div>
                        <div className="flex flex-col"><p><span className='font-bold'>Especiales: </span></p><p>{event.especiales}</p></div>
                    </div>
                    <div className='w-full flex flex-row flex-wrap justify-center gap-1 items-center'>
                        <button className='md:w-1/4 md:max-w-[10rem] bg-venice-blue-600 hover:bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit bg-center'
                            onClick={goToActivities}>Ver actividades</button>
                        {student && event.puedeInscribirse && (
                            <>
                                <button className='md:w-1/4 md:max-w-[10rem] bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg w-fit bg-center'
                                    onClick={requestCollaboration}>Ser colaborador</button>
                                <button className='md:w-1/4 md:max-w-[10rem] bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg w-fit bg-center'
                                    onClick={register}>Inscribirse</button>
                                <button className='md:w-1/4 md:max-w-[10rem] bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg w-fit bg-center'
                                    onClick={interest}>Interés</button>
                                <a
                                    href={`https://api.whatsapp.com/send?text=${currentURL}`}
                                    data-action="share/whatsapp/share"
                                    target="_blank"
                                    onClick={share}><FontAwesomeIcon icon={faWhatsapp} className="text-3xl text-green-500 ml-3" /></a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${currentURL}`}
                                    target="_blank"
                                    onClick={share}
                                    data-size="large"><FontAwesomeIcon icon={faXTwitter} className="text-3xl text-black" /></a>
                            </>
                        )}
                    </div>
                </> :
                <div className="flex flex-col">
                    <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles" />
                </div>}
        </div>

    )
}

export default EventDetails
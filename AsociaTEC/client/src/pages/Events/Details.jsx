import React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { localDateTime } from '../../utils/dateFormatter'
import { useNavigate } from 'react-router-dom'
import { useSessionContext } from "../../context/SessionComponent";

const EventDetails = () => {
    const { uuid } = useParams()
    const [event, setEvent] = useState({})
    const navigate = useNavigate()
    const target = `/event/activities/${uuid}`
    const { getUserType, getUniId } = useSessionContext()
    const student = getUserType() === "Estudiante"

    const goToActivities = (e) => {
        e.preventDefault()
        navigate(target)

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

    return (
        <div>
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold my-6">Detalles del evento</h1>
            <div className='flex flex-col md:grid md:grid-cols-2 gap-4 shadow-lg rounded-lg p-8'>
                <p><span className='text-venice-blue-800 font-semibold'>Título del evento: </span>{event.titulo}</p>
                <p><span className='text-venice-blue-800 font-semibold'>Asociación: </span>{event.asociacion}</p>
                <p><span className='text-venice-blue-800 font-semibold'>Fecha de inicio: </span> {localDateTime(event.fechaInicio)}</p>
                <p><span className='text-venice-blue-800 font-semibold'>Fecha de finalización:</span>{localDateTime(event.fechaFin)}</p>
                <p><span className='text-venice-blue-800 font-semibold'>Descripción: </span>{event.descripcion}</p>
                <p><span className='text-venice-blue-800 font-semibold'>Ubicación: </span>{event.lugar}</p>
                <p><span className='text-venice-blue-800 font-semibold'>Capacidad: </span>{event.capacidad}</p>
                <p><span className='text-venice-blue-800 font-semibold'>Categoría: </span>{event.categoria}</p>
                <p><span className='text-venice-blue-800 font-semibold'>Especiales: </span>{event.especiales}</p>
                <div className='w-full flex flex-col md:flex-row col-span-2 justify-center gap-1'>
                    <button className='md:w-1/4 bg-venice-blue-700 text-white font-bold py-2 px-4 rounded hover:bg-venice-blue-800'
                        onClick={goToActivities}>Ver actividades</button>
                    {(student && event.puedeInscribirse) && <button className='md:w-1/4 bg-teal-700 text-white font-bold py-2 px-4 rounded hover:bg-teal-800'
                        onClick={requestCollaboration}>Ser colaborador</button>}
                    {(student && event.puedeInscribirse) && <button className='bg-green-700 text-white font-bold py-2 px-4 rounded md:w-1/4 hover:bg-green-800'
                        onClick={register}>Inscribirse</button>}
                    {(student && event.puedeInscribirse) && <button className='bg-red-700 text-white font-bold py-2 px-4 rounded md:w-1/4 hover:bg-red-800'
                        onClick={interest}>Interés</button>}
                </div>
            </div>

        </div>
    )
}

export default EventDetails
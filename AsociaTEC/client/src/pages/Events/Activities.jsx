import React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { useNavigate } from 'react-router-dom'
import { useSessionContext } from "../../context/SessionComponent";
import Activity from '../../components/cards/Activity'
const Activities = () => {

    const { uuid } = useParams()
    const [activities, setActivities] = useState([])
    const navigate = useNavigate()
    const { getUserType } = useSessionContext()
    const student = getUserType() === "Estudiante"
    const {session } = useSessionContext();

    const goToEdit = (e, a_uuid) => {
        e.preventDefault()
        if(student) return
        navigate(`/event/edit-activity/${uuid}/${a_uuid}`)
    }

    const goToCreate = (e) => {
        e.preventDefault()
        if(student) return
        navigate(`/event/create-activity/${uuid}`)
    }

    useEffect(() => {

        if (session.currentUser === null) {
            console.log("raro")
            navigate("/");
        }


        axios.get(`/api/actividades/?uuid=${uuid}`, { withCredentials: true })
            .then((res) => {
                setActivities(res.data)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings)
            })
    }, [])
    console.log("ff",activities)
    return (
        <div>
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold my-6">Actividades del evento</h1>
            <div className='flex flex-col md:grid md:grid-cols-2 gap-4 justify-center'>
                {activities.length != 0 ? activities.map((activity) => {
                    return (
                        <Activity
                            key={activity.uuid}
                            nombre={activity.nombre}
                            lugar={activity.lugar}
                            fechaInicio={activity.fechaInicio}
                            fechaFin={activity.fechaFin}
                            uuid={activity.uuid}
                            useType={getUserType()}
                            auxclick={goToEdit}

                        />
                    )
                }): <p className='text-center text-venice-blue-800 font-semibold'>No hay actividades registradas...</p>}
            </div>
            {!student && <div className='flex justify-center mt-4'>
                <button
                    className='bg-venice-blue-800 text-white font-semibold rounded-md px-4 py-2'
                    onClick={goToCreate}
                >
                    Agregar actividad
                </button>
            </div> }
        </div>
        
    )
}
export default Activities
import React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { useNavigate } from 'react-router-dom'
import { useSessionContext } from "../../context/SessionComponent";
import Activity from '../../components/cards/Activity'
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

const Activities = () => {
    const { uuid, association } = useParams()
    const [activities, setActivities] = useState([])
    const navigate = useNavigate()
    const { getUserType } = useSessionContext()
    const student = getUserType() === "Estudiante"
    const asocia = getUserType() === "Asociación"
    const admin = getUserType() === "Administrador"
    const {session, getName } = useSessionContext();
    const [isLoading, setIsLoading] = useState(true);

    const goToEdit = (e, a_uuid) => {
        e.preventDefault()
        if(!(admin || (asocia && getName()==association))) return
        navigate(`/event/edit-activity/${uuid}/${a_uuid}`)
    }

    const goToCreate = (e) => {
        e.preventDefault()
        if(!(admin || (asocia && getName()==association))) return
        navigate(`/event/create-activity/${uuid}`)
    }

    useEffect(() => {

        if (session.currentUser === null) {
            navigate("/");
        }


        axios.get(`/api/actividades/?uuid=${uuid}`, { withCredentials: true })
            .then((res) => {
                setActivities(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings)
            })
    }, [])
    
    return (
        <div className="p-3 lg:w-[64rem] md:flex md:flex-col md:items-center w-full">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold my-6">Actividades del evento</h1>
            {
                activities.length
                ?
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 justify-center w-full'>
                    {
                        activities.map((activity) => 
                            <Activity
                                key={activity.uuid}
                                nombre={activity.nombre}
                                lugar={activity.lugar}
                                fechaInicio={activity.fechaInicio}
                                fechaFin={activity.fechaFin}
                                uuid={activity.uuid}
                                allowModify={(admin || (asocia && getName()==association))}
                                auxclick={goToEdit}

                            />
                        )
                    }
                </div>
                : 
                <div className="flex flex-col md:w-[23rem] lg:w-[40rem] 2xl:w-[43.5rem]">
                    {
                        isLoading
                        ?
                        <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles" />
                        :
                        <p className="text-center text-gray-400 text-xl font-serif font-bold my-3">No hay actividades para este evento</p>
                    }
                </div>
            }
            {
                (admin || (asocia && getName()==association)) &&
                <div className='flex justify-center mt-4'>
                    <button
                        className='bg-venice-blue-700 hover:bg-venice-blue-800 text-white py-2 px-4 rounded-lg w-fit bg-center'
                        onClick={goToCreate}
                    >
                        Agregar actividad
                    </button>
                </div>
            }
        </div>
        
    )
}
export default Activities
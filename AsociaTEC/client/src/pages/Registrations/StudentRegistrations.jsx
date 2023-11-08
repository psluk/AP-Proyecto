import React from 'react'
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import Registration from "../../components/cards/Registration";

const StudentRegistrations = () => {
    const { getUniId } = useSessionContext();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    
    useEffect(() => {
        axios.get(`/api/inscripciones/?carnet=${getUniId()}`)
            .then((res) => {
                setData(res.data)
                if(res.data.length == 0) document.getElementsByName('cargando')[0].innerHTML = 'No hay inscripciones...'
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            });
    }, []);

    return (
        <div className='p-5 w-full md:w-[50rem] md:flex md:flex-col mb-6'>
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Inscripciones
            </h1>
            <div className='grid md:grid-cols-2 gap-2 items-center'>
                {data.length != 0 ? data.map((item, index) => {
                    return (
                        <Registration
                            key={index}
                            idEvento={item.evento.id}
                            carnet={getUniId()} nombre={item.evento.nombre}
                            inicio={item.evento.inicio} fin={item.evento.fin}
                            estado={item.evento.estado}
                        />
                    )

                }) : <p name='cargando' className='text-center text-venice-blue-800 font-serif text-2xl'>Cargando...</p>}

            </div>
        </div>
    )
}

export default StudentRegistrations;
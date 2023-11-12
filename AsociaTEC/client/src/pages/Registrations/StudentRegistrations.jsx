import React from 'react'
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import Registration from "../../components/cards/Registration";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

const StudentRegistrations = () => {
    const { getUniId } = useSessionContext();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        axios.get(`/api/inscripciones/?carnet=${getUniId()}`, { withCredentials: true })
            .then((res) => {
                setData(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            });
    }, []);

    return (
        <div className='p-5 w-full md:w-[50rem] md:flex md:flex-col my-6 flex-auto'>
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Mis eventos
            </h1>
                {
                data.length > 0 ? 
                    <div className='grid md:grid-cols-2 gap-2 items-center'>
                        {
                            data.map((item, index) => 
                                <Registration
                                    key={index}
                                    idEvento={item.evento.id}
                                    carnet={getUniId()} nombre={item.evento.nombre}
                                    inicio={item.evento.inicio} fin={item.evento.fin}
                                    inscripcion={item.inscripcion}
                                />
                            )
                        }
                    </div>
                : 
                    <div className="flex flex-col">
                        {
                            isLoading
                            ?
                            <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles"/>
                            :
                            <p className="text-center text-gray-400 text-xl font-serif font-bold my-3">No se ha inscrito a ningún evento</p>
                        }
                    </div>
                }
        </div>
    )
}

export default StudentRegistrations;
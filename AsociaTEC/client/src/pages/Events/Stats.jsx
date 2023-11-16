import React from 'react'
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStar,
    faStarHalfStroke,
    faCheckDouble,
    faShareNodes,
    faUserPlus,
    faCalendarXmark,
    faSquarePollHorizontal
} from '@fortawesome/free-solid-svg-icons';

import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";
import { useParams } from 'react-router-dom';
const Stats = () => {

    const [stats, setStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { uuid } = useParams();

    useEffect(() => {
        axios.get(`/api/eventos/reporte?uuid=${uuid}`, { withCredentials: true })
            .then((res) => {
                setStats(res.data[0]);
                setIsLoading(false);
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            });
    }, []);
    return (
        <div className='flex flex-col'>
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Datos del evento
            </h1>
            {
                !isLoading
                ?
                <div className='flex flex-col gap-8 md:flex-row'>
                    <div className='flex flex-col gap-2 p-4 '>
                        <h2 className='text-center text-xl font-serif text-venice-blue-600 font-bold'>Estadisticas del evento</h2>
                        <p><FontAwesomeIcon icon={faUserPlus} className='text-green-800' /> <b>Inscripciones:</b> {stats.inscripciones}</p>
                        <p><FontAwesomeIcon icon={faCheckDouble} className='text-lime-700' /> <b>Confirmaciones:</b> {stats.confirmados}</p>
                        <p><FontAwesomeIcon icon={faStar} className='text-yellow-600' /> <b>Estrellas:</b> {stats.estrellas}</p>
                        <p><FontAwesomeIcon icon={faSquarePollHorizontal} className='text-venice-blue-800' /> <b>Número de calificaciones:</b> {stats.calificaciones}</p>
                        <p><FontAwesomeIcon icon={faCalendarXmark} className='text-red-800' /> <b>Inscripciones canceladas:</b> {stats.cancelados}</p>
                        <p><FontAwesomeIcon icon={faShareNodes} className='text-venice-blue-800' /> <b>Veces compartido:</b> {stats.compartidos}</p>
                    </div>
                    <div className='flex flex-col gap-2 p-4'>
                        <h2 className='text-center text-xl font-serif text-venice-blue-600 font-bold'>Analisis de las Estadisticas</h2>
                        <ul className='list-disc list-inside [&>li]:mt-2'>
                            <li>El evento tiene un {stats.calificaciones != 0 ? (stats.estrellas / stats.calificaciones).toFixed(1).replace(".", ",") : 0} de calificación promedio</li>
                            <li>El evento tiene un {stats.inscripciones != 0 ? Math.round(stats.confirmados / stats.inscripciones * 100) : 0}&nbsp;% de confirmación promedio</li>
                            <li>El evento tiene un {stats.inscripciones != 0 ? Math.round(stats.cancelados / stats.inscripciones * 100) : 0}&nbsp;% de cancelación promedio</li>
                            <li>El evento tiene un {stats.inscripciones != 0 ? Math.round(stats.compartidos / stats.inscripciones * 100) : 0}&nbsp;% de compartición promedio</li>
                        </ul>
                    </div>
                </div>
                : <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles" />
            }
        </div>
    )
}

export default Stats
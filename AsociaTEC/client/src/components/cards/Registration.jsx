import React from 'react'
import { EventIcon, QRIcon, ClockIcon, ClockWithXIcon } from '../../components/Icons';
import { faSquarePollHorizontal, faCalendarXmark, faCalendarCheck, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { localDateTime, currentLocalHtmlAttribute, localHtmlAttribute } from '../../utils/dateFormatter';
import axios from 'axios';
import { toast } from 'react-toastify';
import { messageSettings, defaultError } from '../../utils/messageSettings';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confirmation from '../modals/Confirmation';

const Registration = ({ idEvento, carnet, nombre, inicio, fin, inscripcion }) => {

    const [state, setState] = useState(inscripcion.confirmada)
    const Navigate = useNavigate()
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    };

    const compareToCurrentDate = (date) => {
        return currentLocalHtmlAttribute() > localHtmlAttribute(date)
    }

    const handleConfirm = (e) => {
        compareToActualDate(fin)
        axios.put(`/api/inscripciones/confirmar`, { evento: idEvento, carnet: carnet })
            .then((res) => {
                toast.success(res.data.mensaje, messageSettings);
                setState(true)
            }).catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    const handleCancel = (e) => {
        setModal(false);
        axios.delete(`/api/inscripciones/eliminar?evento=${idEvento}&carnet=${carnet}`)
            .then((res) => {
                toast.success(res.data.mensaje, messageSettings);
                Navigate("/registrations")
            }).catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    const handleQR = (e) => {
        console.log('QR')
    }


    return (
        <div className='w-full border-2 rounded-md shadow-lg flex flex-col md:flex-row p-2 hover:bg-zinc-100 md:items-center'>
            <div className='flex flex-col grow'>
                <p className='flex '>
                    <EventIcon className='w-6 h-6 text-venice-blue-800' /><span className='ml-2 font-bold font-serif text-venice-blue-800 text-lg'>{nombre}</span>
                </p>
                <p className='flex '>
                    <ClockIcon className='w-6 h-6 text-venice-blue-800' /><span className='ml-2'>{localDateTime(inicio)}</span>
                </p>
                <p className='flex '>
                    <ClockWithXIcon className='w-6 h-6 text-venice-blue-800' /><span className='ml-2'>{localDateTime(fin)}</span>
                </p>
            </div>
            <div className='flex md:flex-col grow-0 justify-around md:justify-between items-end'>
                {(!state && !compareToCurrentDate(fin))
                    && <button onClick={handleConfirm} disabled={compareToCurrentDate(fin)}><FontAwesomeIcon icon={faCalendarCheck} className={`text-xl ${compareToCurrentDate(fin) ? 'text-gray-800' : 'text-venice-blue-800'}`} /></button>}
                {!compareToCurrentDate(inicio)
                    && <button onClick={toggleModal} disabled={compareToCurrentDate(fin)}><FontAwesomeIcon icon={faCalendarXmark} className={`text-xl ${compareToCurrentDate(fin) ? 'text-gray-800' : 'text-venice-blue-800'}`} /></button>}
                {(state && !compareToCurrentDate(fin))
                    && <button onClick={handleQR}><FontAwesomeIcon icon={faQrcode} className='text-xl text-venice-blue-800' /></button>}
                {((state && inscripcion.encuestaActiva)
                    && compareToCurrentDate(fin)) && <button ><FontAwesomeIcon className="text-xl text-venice-blue-800" icon={faSquarePollHorizontal} title="Encuesta" /></button>}
            </div>
            <Confirmation
                handleClose={toggleModal}
                handleConfirm={handleCancel}
                title="Confirmar eliminación"
                message="¿Está seguro de que desea eliminar esta inscripcion?"
                confirmationText="Eliminar"
                confirmColor="bg-red-600"
                modal={modal}
            />
        </div>
    )
}

export default Registration
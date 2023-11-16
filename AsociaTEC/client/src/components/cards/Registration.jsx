import React from 'react'
import { EventIcon, QRIcon, ClockIcon, ClockWithXIcon } from '../../components/Icons';
import { faSquarePollHorizontal, faCalendarXmark, faCalendarCheck, faQrcode, faCalendarPlus, faCalendarMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { localDateTime, currentLocalHtmlAttribute, localHtmlAttribute } from '../../utils/dateFormatter';
import axios from 'axios';
import { toast } from 'react-toastify';
import { messageSettings, defaultError } from '../../utils/messageSettings';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confirmation from '../modals/Confirmation';
import QRModal from '../modals/QRModal';

const Registration = ({ idEvento, carnet, nombre, inicio, fin, inscripcion }) => {

    const [confirm, setConfirm] = useState(inscripcion.confirmada)
    const [interest, setInterest] = useState(inscripcion.inscrito)
    const navigate = useNavigate()
    const [modal, setModal] = useState(false);
    const [modalQR, setModalQR] = useState(false);
    const [image, setImage] = useState(`api/inscripciones/qr?evento=${idEvento}&carnet=${carnet}`);

    const toggleModalQR = () => {
        setModalQR(!modalQR);
    }

    const toggleModal = () => {
        setModal(!modal);
    };

    const compareToCurrentDate = (date) => {
        return currentLocalHtmlAttribute() > localHtmlAttribute(date)
    }

    const handleCreateFeedback = () => {
        
        if ((confirm && inscripcion.encuestaActiva) && compareToCurrentDate(fin)) {
            navigate(`/feedback/${idEvento}`)
        } else {
            toast.error("Encuesta no disponible", messageSettings);
        }        
    }

    const handleConfirm = (e) => {
        axios.put(`/api/inscripciones/confirmar`, { evento: idEvento, carnet: carnet }, { withCredentials: true })
            .then((res) => {
                toast.success(res.data.mensaje, messageSettings);
                setConfirm(true)
            }).catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    const handleCancel = (e) => {
        setModal(false);
        axios.delete(`/api/inscripciones/eliminar?evento=${idEvento}&carnet=${carnet}`, { withCredentials: true })
            .then((res) => {
                toast.success(res.data.mensaje, messageSettings);
                window.location.reload()
            }).catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    const handleRegister = () => {
        axios.post(`/api/inscripciones/agregar`, { evento: idEvento, carnet: carnet }, { withCredentials: true })
            .then((res) => {
                handleUnregister()
                toast.success(res.data.mensaje, messageSettings);
                setInterest(true)
            }).catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    const handleUnregister = () => {
        axios.delete(`/api/interes/eliminar?evento${idEvento}&carnet=${carnet}`, { withCredentials: true })
            .then((response) => {
                toast.success(response.data.mensaje, messageSettings);
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    return (
        <div className='w-full border-2 rounded-md shadow-lg flex flex-col md:flex-row p-2 hover:bg-zinc-100 md:items-center'>
            <div className='flex flex-col grow'>
                <p className='text-center text-venice-blue-700 font-semibold'>{interest ? 'Evento inscrito' : 'Evento de interés'}</p>
                <p className='flex '>
                    <EventIcon className='w-6 h-6 text-venice-blue-800' /><span className='ml-2 font-bold font-serif text-venice-blue-800 text-lg'>{nombre}</span>
                </p>
                <p className='flex '>
                    <ClockIcon className='w-6 h-6 text-venice-blue-800' /><span className='ml-2'>{localDateTime(inicio, 'long')}</span>
                </p>
                <p className='flex '>
                    <ClockWithXIcon className='w-6 h-6 text-venice-blue-800' /><span className='ml-2'>{localDateTime(fin, 'long')}</span>
                </p>
            </div>
            <div className='flex md:flex-col grow-0 justify-around md:justify-between items-end pt-4 md:p-0'>
                {(!confirm && !compareToCurrentDate(fin) && interest)
                    && <button onClick={handleConfirm} disabled={compareToCurrentDate(fin)}><FontAwesomeIcon icon={faCalendarCheck} className={`text-xl ${compareToCurrentDate(fin) ? 'text-gray-800' : 'text-venice-blue-800'}`} /></button>}
                {!compareToCurrentDate(fin) && interest
                    && <button onClick={toggleModal} disabled={compareToCurrentDate(fin)}><FontAwesomeIcon icon={faCalendarXmark} className={`text-xl ${compareToCurrentDate(fin) ? 'text-gray-800' : 'text-venice-blue-800'}`} /></button>}
                {(confirm && !compareToCurrentDate(fin))
                    && <button onClick={toggleModalQR}><FontAwesomeIcon icon={faQrcode} className='text-xl text-venice-blue-800' /></button>}
                {((confirm && inscripcion.encuestaActiva)
                    && compareToCurrentDate(fin)) && <button onClick={handleCreateFeedback} ><FontAwesomeIcon className="text-xl text-venice-blue-800" icon={faSquarePollHorizontal} title="Realizar encuesta" /></button>}
                {(!interest && !compareToCurrentDate(fin)) && <button onClick={(e) => { handleRegister }}><FontAwesomeIcon className="text-xl text-venice-blue-800" icon={faCalendarPlus} title="Inscribirse" /></button>}
                {(!interest && !compareToCurrentDate(fin)) && <button ><FontAwesomeIcon className="text-xl text-venice-blue-800" icon={faCalendarMinus} title="Cancelar" /></button>}

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
            <QRModal
                handleClose={toggleModalQR}
                modal={modalQR}
                image={image}
            />
        </div>
    )
}

export default Registration
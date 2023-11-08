import React from 'react'
import { ConfirmEventIcon, EventIcon, CancelEventIcon, QRIcon, ClockIcon, ClockWithXIcon } from '../../components/Icons';
import { localDateTime } from '../../utils/dateFormatter';
import axios from 'axios';
import { toast } from 'react-toastify';
import { messageSettings, defaultError } from '../../utils/messageSettings';
import { useState } from 'react';
const Registration = ({ idEvento, carnet, nombre, inicio, fin, estado }) => {

    const [state, setState] = useState(estado)

    const handleConfirm = (e) => {
        axios.put(`/api/inscripciones/confirmar`, {evento: idEvento, carnet: carnet})
        .then((res) => {
            toast.success(res.data.mensaje, messageSettings);
            setState(true)
        }).catch((err) => {
            toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
        })
    }

    const handleCancel = (e) => {
        
        axios.delete(`/api/inscripciones/eliminar?evento=${idEvento}&carnet=${carnet}`)
        .then((res) => {
            toast.success(res.data.mensaje, messageSettings);
            window.location.reload(false);
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
                <p className='flex '><EventIcon className='w-6 h-6 text-venice-blue-800'/><span className='ml-2 font-bold font-serif text-venice-blue-800 text-lg'>{nombre}</span></p>
                <p className='flex '><ClockIcon className='w-6 h-6 text-venice-blue-800'/><span className='ml-2'>{localDateTime(inicio)}</span></p>
                <p className='flex '><ClockWithXIcon className='w-6 h-6 text-venice-blue-800'/><span className='ml-2'>{localDateTime(fin)}</span></p>
            </div>
            <div className='flex md:flex-col grow-0 justify-around md:justify-between items-end'>
                {!state &&<button onClick={handleConfirm}><ConfirmEventIcon className='w-6 h-6 text-venice-blue-800'/></button>}
                <button onClick={handleCancel}><CancelEventIcon className='w-6 h-6 text-venice-blue-800'/></button>
                {state && <button onClick={handleQR}><QRIcon className='w-6 h-6 text-venice-blue-800'/></button>}
            </div>
        </div>
    )
}

export default Registration
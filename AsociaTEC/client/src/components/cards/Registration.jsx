import React from 'react'
import { ConfirmEventIcon, EventIcon, CancelEventIcon, QRIcon, ClockIcon, ClockWithXIcon } from '../../components/Icons';
import { localDateTime } from '../../utils/dateFormatter';
const Registration = ({ nombre, inicio, fin, estado }) => {
    return (
        <div className='w-full border-2 rounded-md shadow-lg flex flex-col md:flex-row p-2 hover:bg-zinc-100 md:items-center'>
            <div className='flex flex-col grow'>
                <p className='flex '><EventIcon className='w-6 h-6 text-venice-blue-800'/><span className='ml-2 font-bold font-serif text-venice-blue-800 text-lg'>{nombre}</span></p>
                <p className='flex '><ClockIcon className='w-6 h-6 text-venice-blue-800'/><span className='ml-2'>{localDateTime(inicio)}</span></p>
                <p className='flex '><ClockWithXIcon className='w-6 h-6 text-venice-blue-800'/><span className='ml-2'>{localDateTime(fin)}</span></p>
            </div>
            <div className='flex md:flex-col grow-0 justify-around md:justify-between items-end'>
                {!estado &&<button className=''><ConfirmEventIcon className='w-6 h-6 text-venice-blue-800'/></button>}
                <button className=''><CancelEventIcon className='w-6 h-6 text-venice-blue-800'/></button>
                {estado && <button className=''><QRIcon className='w-6 h-6 text-venice-blue-800'/></button>}
            </div>
        </div>
    )
}

export default Registration
import React from 'react'
import { ConfirmEventIcon, EventIcon, CancelEventIcon, QRIcon, ClockIcon, ClockWithXIcon } from '../../components/Icons';

const Registration = ({ nombre, inicio, fin, estado }) => {
    return (
        <div className='w-full border-2 rounded-md shadow-lg md:grid md:grid-cols-2 p-2 hover:bg-zinc-100 items-center'>
            <div className='flex flex-col'>
                <p className='flex '><EventIcon className='w-6 h-6 text-venice-blue-800'/><span className='ml-2 font-bold font-serif text-venice-blue-800 text-lg'>{nombre}</span></p>
                <p className='flex '><ClockIcon className='w-6 h-6 text-venice-blue-800'/><span className='ml-2'>{inicio}</span></p>
                <p className='flex '><ClockWithXIcon className='w-6 h-6 text-venice-blue-800'/><span className='ml-2'>{fin}</span></p>
            </div>
            <div className='flex md:flex-col justify-around md:justify-between items-end'>
                {!estado &&<button className=''><ConfirmEventIcon className='w-6 h-6 text-venice-blue-800'/></button>}
                <button className=''><CancelEventIcon className='w-6 h-6 text-venice-blue-800'/></button>
                {estado && <button className=''><QRIcon className='w-6 h-6 text-venice-blue-800'/></button>}
            </div>
        </div>
    )
}

export default Registration
import React from 'react'
import { localDateTime } from '../../utils/dateFormatter'

const Activity = ({nombre, lugar, fechaInicio, fechaFin, uuid ,auxclick}) => {

  const handleclick = (e) => {
    e.preventDefault()
    auxclick(e, uuid)
}

  return (
    <button className='flex flex-col shadow-lg rounded-md p-4'
    onClick={handleclick}>
        <p><span className='text-venice-blue-800 font-semibold'>Nombre de la actividad: </span>{nombre}</p>
        <p><span className='text-venice-blue-800 font-semibold'>Lugar de la actividad: </span>{lugar}</p>
        <p><span className='text-venice-blue-800 font-semibold'>Fecha de inicio: </span> {localDateTime(fechaInicio)}</p>
        <p><span className='text-venice-blue-800 font-semibold'>Fecha de finalización: </span>{localDateTime(fechaFin)}</p>
    </button>
  )
}

export default Activity
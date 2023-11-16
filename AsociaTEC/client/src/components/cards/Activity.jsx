import React from 'react'
import { localDateTime } from '../../utils/dateFormatter'

const Activity = ({ nombre, lugar, fechaInicio, fechaFin, uuid, allowModify, auxclick }) => {

  const handleclick = (e) => {
    e.preventDefault()
    if (allowModify) {
      auxclick(e, uuid)
    }
  }

  return (
    <div className={`md:shadow-md w-full border-b md:border-none md:m-2 md:rounded-xl p-3 flex flex-col ${allowModify ? 'cursor-pointer' : ''}`}
      onClick={handleclick}>
      <p><span className='font-bold'>Nombre: </span>{nombre}</p>
      <p><span className='font-bold'>Lugar: </span>{lugar}</p>
      <p><span className='font-bold'>Inicio: </span> {localDateTime(fechaInicio, "long")}</p>
      <p><span className='font-bold'>Finalización: </span>{localDateTime(fechaFin, "long")}</p>
    </div>
  )
}

export default Activity
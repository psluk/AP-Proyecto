import React from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { useEffect, useState } from 'react'
import { faTrashCan, faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSessionContext } from "../../context/SessionComponent";
import { useNavigate } from 'react-router-dom'
import Confirmation from '../../components/modals/Confirmation'
import RequestConfirmation from '../../components/modals/RequestConfirmation'

const Requests = () => {
    const { uuid } = useParams()
    const { getEmail } = useSessionContext();
    const [requests, setRequests] = useState([])
    const [carnet, setCarnet] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [modalDelete, setModalDelete] = useState(false)
    const [modalAccept, setModalAccept] = useState(false)

    useEffect(() => {
        axios.get(`/api/colaboradores/solicitudes/?correo=${getEmail()}&uuid=${uuid}`, { withCredentials: true })
            .then(res => {
                const dataFiltered = res.data.filter(item => item.aceptado == null)
                setRequests(dataFiltered)
            })
            .catch(err => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }, [])

    const handleClickDelete = (carnetDelete) => {
        setCarnet(carnetDelete)
        toggleModalDelete()
    }

    const toggleModalDelete = () => {
        setModalDelete(!modalDelete)
    }

    const handleDelete = () => {
        toggleModalDelete()
        axios.post(`/api/colaboradores/solicitudes/decidir`,{carnet,uuid,descripcion:'Rechazado',aceptar:0}, { withCredentials: true })
            .then(res => {
                toast.success(res.data.mensaje, messageSettings);
                setRequests(requests.filter(item => item.carnet !== carnet))
            })
            .catch(err => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    const toggleModalAccept = () =>{
        setModalAccept(!modalAccept)
    }

    const handleClickAccept = (carnetAccept) =>{
        setCarnet(carnetAccept)
        toggleModalAccept()
    }

    const handleAccept = () => {
        toggleModalAccept()
        axios.post(`/api/colaboradores/solicitudes/decidir`,{carnet,uuid,descripcion,aceptar:1}, { withCredentials: true })
            .then(res => {
                toast.success(res.data.mensaje, messageSettings);
                setRequests(requests.filter(item => item.carnet !== carnet))
            })
            .catch(err => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    return (
        <div className='w-full flex flex-col items-center'>
            <h1 className='text-center text-4xl font-serif text-venice-blue-800 font-bold mb-8'>Lista de colaboradores</h1>
            <div className=' flex flex-col items-center'>
                <table className='text-center table-auto md:table-fixed shadow-lg '>
                    <thead className=' text-center text-venice-blue-700 md:text-lg bg-gray-100 '>
                        <tr className="[&>th]:px-2 md:[&>th]:px-8 [&>th]:py-2">
                            <th>Nombre</th>
                            <th>Carnet</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((item, index) => {
                            return (
                                <tr key={index} className='bg-white border-b-2 border-venice-blue-200 [&>td]:px-2 [&>td]:py-2'>
                                    <td>{`${item.nombre} ${item.apellido1} ${item.apellido2}`}</td>
                                    <td >{item.carnet}</td>
                                    <td className='border-l-2'>
                                    <FontAwesomeIcon id={item.carnet} onClick={(e) => { handleClickAccept(item.carnet) }} icon={faCheck} className='text-xl text-venice-blue-800 cursor-pointer mr-4' />
                                    <FontAwesomeIcon id={item.carnet} onClick={(e) => { handleClickDelete(item.carnet) }} icon={faTrashCan} className='text-xl text-red-600 cursor-pointer' />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <Confirmation
                modal={modalDelete}
                handleClose={toggleModalDelete}
                handleConfirm={handleDelete}
                title='Eliminar colaborador'
                confirmColor="bg-red-600"
                confirmationText='Eliminar'
                message='¿Está seguro que desea eliminar esta solicitud?'
            />
            <RequestConfirmation
                modal={modalAccept}
                handleClose={toggleModalAccept}
                handleConfirm={handleAccept}
                title='Eliminar colaborador'
                confirmColor="bg-venice-blue-600"
                confirmationText='Aceptar'
                setDescripcion={setDescripcion}
            />
        </div>
    )
}

export default Requests
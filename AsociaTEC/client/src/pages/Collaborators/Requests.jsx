import React from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { useEffect, useState } from 'react'
import { faTrash, faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSessionContext } from "../../context/SessionComponent";
import { useNavigate } from 'react-router-dom'
import Confirmation from '../../components/modals/Confirmation'
import RequestConfirmation from '../../components/modals/RequestConfirmation'
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

const Requests = () => {
    const { uuid } = useParams();
    const [requests, setRequests] = useState([])
    const [carnet, setCarnet] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [modalDelete, setModalDelete] = useState(false)
    const [modalAccept, setModalAccept] = useState(false)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/colaboradores/solicitudes/?uuid=${uuid}`, { withCredentials: true })
            .then(res => {
                const dataFiltered = res.data.filter(item => item.aceptado == null);
                setRequests(dataFiltered);
                setIsLoading(false);
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
            <h1 className='text-center text-4xl font-serif text-venice-blue-800 font-bold mb-8'>Lista de solicitudes</h1>
            <div className=' flex flex-col items-center'>
                {
                    requests.length > 0
                    ?
                    <div className="rounded-xl border overflow-hidden shadow-lg">
                        <table className={`text-center table-auto md:table-fixed shadow-lg`}>
                            <thead className='font-serif text-center text-venice-blue-800 md:text-lg bg-gray-200 '>
                                <tr className="[&>th]:px-2 md:[&>th]:px-8 [&>th]:py-2">
                                    <th>Nombre</th>
                                    <th>Carné</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="[&>tr:last-child]:border-b-0">
                                {requests.map((item, index) => {
                                    return (
                                        <tr key={index} className='bg-white border-b-2 border-b-venice-blue-800 [&>td]:px-2 [&>td]:py-2'>
                                            <td>{`${item.nombre} ${item.apellido1} ${item.apellido2}`}</td>
                                            <td >{item.carnet}</td>
                                            <td>
                                            <FontAwesomeIcon id={item.carnet} onClick={(e) => { handleClickAccept(item.carnet) }} icon={faCheck} className='text-xl text-venice-blue-800 cursor-pointer mr-4' />
                                            <FontAwesomeIcon id={item.carnet} onClick={(e) => { handleClickDelete(item.carnet) }} icon={faTrash} className='text-xl text-red-600 cursor-pointer' />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    :
                    <>
                        {
                            isLoading
                            ?
                            <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles"/>
                            :
                            <p className="text-center text-gray-400 text-xl font-serif font-bold my-3">No hay solicitudes</p>
                        }
                    </>
                    }
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
                title='Aceptar colaborador'
                confirmColor="bg-venice-blue-600"
                confirmationText='Aceptar'
                setDescripcion={setDescripcion}
            />
        </div>
    )
}

export default Requests
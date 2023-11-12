import React from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { useEffect, useState } from 'react'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AddCollaboratorModal from '../../components/modals/AddCollaborator'
import { useSessionContext } from "../../context/SessionComponent";
import { useNavigate } from 'react-router-dom'
import Confirmation from '../../components/modals/Confirmation'

const CollaboratorList = () => {
    const [modalDelete, setModalDelete] = useState(false)
    const [modalAdd, setModalAdd] = useState(false)
    const [collaborators, setCollaborators] = useState([])
    const { uuid } = useParams()
    const { getEmail } = useSessionContext();
    const [carnet, setCarnet] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const navigate = useNavigate()

    const requestData = () =>{
        axios.get(`/api/colaboradores/?correo=${getEmail()}&uuid=${uuid}`, { withCredentials: true })
            .then(res => {
                setCollaborators(res.data)
            })
            .catch(err => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }
    useEffect(() => {
        requestData()
    }, [])

    const handleDelete = () => {
        toggleModalDelete()
        axios.delete(`/api/colaboradores/eliminar?uuid=${uuid}&carnet=${carnet}`, { withCredentials: true })
            .then(res => {
                toast.success(res.data.mensaje, messageSettings);
                setCollaborators(collaborators.filter(item => item.carnet !== carnet))
            })
            .catch(err => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    const handleAdd = () => {
        toggleModalAdd()
        axios.post(`/api/colaboradores/agregar`, { uuid, carnet, descripcion }, { withCredentials: true })
            .then(res => {
                toast.success(res.data.mensaje, messageSettings);
                requestData()
            })
            .catch(err => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
    }

    const handleClickDelete = (carnet) => {
        setCarnet(carnet)
        toggleModalDelete()
    }
    const toggleModalDelete = () => {

        setModalDelete(!modalDelete)
    }

    const toggleModalAdd = () => {
        setModalAdd(!modalAdd)
    }

    return (
        <div className='w-full flex flex-col items-center'>
            <h1 className='text-center text-4xl font-serif text-venice-blue-800 font-bold mb-8'>Lista de colaboradores</h1>
            <div className=' flex flex-col items-center'>
                <div className='w-full flex gap-2 text-xs justify-around'>
                    <button onClick={toggleModalAdd} className='bg-venice-blue-700 text-white p-2 rounded-lg mb-4'>Añadir colaborador</button>
                    <button onClick={()=>{navigate(`/collaborators/request/${uuid}`)}}className='bg-venice-blue-700 text-white p-2 rounded-lg mb-4'>Ver solicitudes</button>
                </div>

                <table className='text-center table-auto md:table-fixed shadow-lg '>
                    <thead className=' text-center text-venice-blue-700 md:text-lg bg-gray-100 '>
                        <tr className="[&>th]:px-2 md:[&>th]:px-8 [&>th]:py-2">
                            <th>Nombre</th>
                            <th>Carnet</th>
                            <th>Descripción</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {collaborators.map((item, index) => {
                            return (
                                <tr key={index} className='bg-white border-b-2 border-venice-blue-200 [&>td]:px-2 [&>td]:py-2'>
                                    <td>{`${item.nombre} ${item.apellido1} ${item.apellido2}`}</td>
                                    <td >{item.carnet}</td>
                                    <td >{item.descripcion}</td>
                                    <td className='border-l-2'><FontAwesomeIcon id={item.carnet} onClick={(e) => { handleClickDelete(item.carnet) }} icon={faTrashCan} className='text-xl text-red-600 cursor-pointer' /></td>
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
                message='¿Está seguro que desea eliminar este colaborador?'
            />
            <AddCollaboratorModal
                modal={modalAdd}
                handleClose={toggleModalAdd}
                handleConfirm={handleAdd}
                setCarnet={setCarnet}
                setDescripcion={setDescripcion}
            />
        </div>
    )
}

export default CollaboratorList
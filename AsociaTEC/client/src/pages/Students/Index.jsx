import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { messageSettings } from "../../utils/messageSettings";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";
import { faTrash, faPencil } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Confirmation from '../../components/modals/Confirmation'
import { useNavigate } from "react-router-dom";

const StudentList = () => {
    const navigate = useNavigate();
    const [modal, setModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [carnet, setCarnet] = useState(undefined);
    const target = `/student/edit/`;

    useEffect(() => {
        axios.get("/api/estudiantes", { withCredentials: true })
            .then((response) => {
                setStudents(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se pudieron cargar los estudiantes", messageSettings);
            });
    }, []);
    
    const goToDetail = (currentTarget) => {
        navigate(currentTarget);
    };

    const handleDelete = () => {
        toggleModal();
        if (carnet) {
            axios.delete(`/api/estudiantes/eliminar?carnet=${carnet}`, { withCredentials: true })
            .then(res => {
                toast.success(res.data.mensaje, messageSettings);
                setStudents(students.filter(item => item.carnet !== carnet))
            })
            .catch(err => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            })
        }
    }

    const handleClickDelete = (carnet) => {
        setCarnet(carnet);
        toggleModal();
    }

    const toggleModal = () => {
        setModal(!modal);
    }

    return (
        <div className="py-5 sm:px-5 w-full md:px-12 lg:px-20 flex-auto">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold my-6">
                Estudiantes
            </h1>
            {
                students.length > 0
                ? 
                <div className="rounded-xl border overflow-hidden shadow-lg">
                    <table className='text-center table-auto md:table-fixed shadow-lg hyphens-auto md:hyphens-none'>
                        <thead className='text-center text-venice-blue-800 md:text-lg bg-gray-100 font-serif'>
                            <tr className="[&>th]:px-2 md:[&>th]:px-8 [&>th]:py-2">
                                <th>Nombre</th>
                                <th>Carné</th>
                                <th>Sede</th>
                                <th>Carrera</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody className="[&>tr:last-child]:border-b-0">
                            {students.map((item, index) => {
                                return (
                                    <tr key={index} className='bg-white border-b-2 border-venice-blue-800 [&>td]:px-2 [&>td]:py-2'>
                                        <td>{`${item.nombre} ${item.apellido1} ${item.apellido2}`.trim()}</td>
                                        <td>{item.carnet}</td>
                                        <td>{`${item.sede.nombre} (${item.sede.codigo})`}</td>
                                        <td>{`${item.carrera.nombre} (${item.carrera.codigo})`}</td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <a
                                                    href={target + item.carnet}
                                                    onClick={(e) => { e.preventDefault; goToDetail(target + item.carnet); }}>
                                                        <FontAwesomeIcon className="text-xl text-venice-blue-800" icon={faPencil} title="Modificar" />
                                                </a>
                                                <FontAwesomeIcon id={item.carnet} onClick={(e) => { handleClickDelete(item.carnet) }} icon={faTrash} className='text-xl text-red-600 cursor-pointer' />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                : 
                <div className="flex flex-col">
                    {
                        isLoading
                        ?
                        <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles"/>
                        :
                        <p className="text-center text-gray-400 text-xl font-serif font-bold my-3">No hay estudiantes</p>
                    }
                </div>
            }
            <Confirmation
                modal={modal}
                handleClose={toggleModal}
                handleConfirm={handleDelete}
                title='Eliminar colaborador'
                confirmColor="bg-red-600"
                confirmationText='Eliminar'
                message='¿Está seguro de que desea eliminar este estudiante?'
            />
        </div>
    )
}

export default StudentList;
import { faGraduationCap, faPencil, faTrash, faTreeCity } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Confirmation from "../modals/Confirmation";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";

const AssociationCard = ({ association, onDelete }) => {
    const navigate = useNavigate();
    const target = `/association/edit/${association.sede.codigo}/${association.carrera.codigo}`;
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    };
    
    const goToDetail = (e) => {
        e.preventDefault();
        navigate(target);
    };

    const deleteAssociation = () => {
        setModal(false);
        axios.delete(`/api/asociaciones/eliminar?correo=${association.asociacion.correo}`, { withCredentials: true })
            .then((res) => {
                toast.success("Asociación eliminada con éxito", messageSettings);
                navigate("/associations");
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            });
        onDelete(association.sede.codigo, association.carrera.codigo);
    };

    return (
        <div className="md:shadow-md border-b md:border-none md:m-2 md:rounded-xl p-3 flex flex-col md:flex-row md:items-center">
            <div className="grow">
                <a
                    href={target}
                    onClick={goToDetail}>
                        <p
                            className="font-bold font-serif text-venice-blue-800 text-lg">
                                {association.asociacion.nombre}
                        </p>
                </a>
                <div className="flex flex-row items-center">
                    <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-venice-blue-800" />
                    <p>{association.carrera.nombre}</p>
                </div>
                <div className="flex flex-row items-center">
                    <FontAwesomeIcon icon={faTreeCity} className="mr-2 text-venice-blue-800" />
                    <p>{association.sede.nombre}</p>
                </div>
            </div>
            <div className="flex flex-row mt-2 md:mt-0 md:ml-2 md:flex-col grow-0 justify-around md:justify-center md:space-y-2">
                <a
                    href={target}
                    onClick={goToDetail}>
                        <FontAwesomeIcon className="text-xl text-venice-blue-800" icon={faPencil} title="Modificar" />
                </a>
                <FontAwesomeIcon className="text-xl text-red-700 cursor-pointer" icon={faTrash} onClick={toggleModal} title="Eliminar" />
            </div>
            <Confirmation
                handleClose={toggleModal}
                handleConfirm={deleteAssociation}
                title="Confirmar eliminación"
                message="¿Está seguro de que desea eliminar esta asociación?"
                confirmationText="Eliminar"
                confirmColor="bg-red-600"
                modal={modal}
            />
        </div>
    )
};

export default AssociationCard;
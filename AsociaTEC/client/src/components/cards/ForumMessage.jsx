import { faGraduationCap, faBookBookmark, faCircleCheck, faXmarkCircle, faPerson, faMessage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import Confirmation from "../modals/Confirmation";
import { useEffect, useState } from "react";

const ForumMessage = ({ message, userType, errase }) => {
    const navigate = useNavigate();
    const [asociation, setAsociation] = useState(false);
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    };

    const handleErrase = (e) => {
        e.preventDefault()
        errase(e, message.identificador)
    };

    // Load locations and association data
    useEffect(() => {

        if (message.autor.carnet === undefined) {
            //tenemos a una asociacion
            setAsociation(true)
        }

    }, []);



    return (
        <div className="md:shadow-md border-b md:border-none md:m-2 md:rounded-xl p-3 flex flex-col md:flex-row md:items-center">
            <div className="grow">

                <div className="flex flex-row items-center">
                    <FontAwesomeIcon icon={faPerson} className="mr-2 text-venice-blue-800" />
                    <p><strong>Autor: </strong> {message.autor.nombre}</p>
                    {
                    userType === "Administrador" ?
                    <button className="ml-auto" ><FontAwesomeIcon icon={faTrash} className=" text-red-500" onClick={toggleModal}/> </button>
                    : ""
                    }
                </div>
                {
                    asociation ?
                        <div className="flex flex-row items-center">
                            <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-venice-blue-800" />
                            <p><strong>Asociacion</strong></p>
                        </div> :
                        <div className="flex flex-row items-center">
                            <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-venice-blue-800" />
                            <p><strong>Carnet: </strong>  {message.autor.carnet}</p>
                        </div>
                }
                <div className="flex flex-row items-center">
                    <FontAwesomeIcon icon={faMessage} className="mr-2 text-venice-blue-800" />
                    <p><strong>Mensaje: </strong>  {message.contenido}</p>
                </div>
            </div>
            <Confirmation
                handleClose={toggleModal}
                handleConfirm={handleErrase}
                title="Confirmar eliminación"
                message="¿Está seguro de que desea eliminar el mensaje?"
                confirmationText="Eliminar"
                confirmColor="bg-red-600"
                modal={modal}
            />
        </div>
    )
};

export default ForumMessage;


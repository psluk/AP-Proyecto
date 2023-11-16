import { faGraduationCap, faBookBookmark, faCircleCheck, faXmarkCircle, faPerson, faMessage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import Confirmation from "../modals/Confirmation";
import { useEffect, useState } from "react";
import { localDateTime } from "../../utils/dateFormatter";

const ForumMessage = ({ message, userType, erase }) => {
    const navigate = useNavigate();
    const [asociation, setAsociation] = useState(false);
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    };

    const handleErase = (e) => {
        e.preventDefault()
        erase(e, message.identificador)
    };

    // Load locations and association data
    useEffect(() => {

        if (message.autor.carnet === undefined) {
            //tenemos a una asociacion
            setAsociation(true)
        }

    }, []);


    return (
        <div className="md:shadow-md border-b md:border-none md:my-2 md:rounded-xl flex flex-col md:items-center w-full overflow-hidden">
            <header className="flex flex-row items-center bg-gray-200 p-3 w-full">
                <div className="flex flex-col">
                    <p>
                        <span className="font-serif font-bold text-venice-blue-800 text-md">{message.autor.nombre.trim()}</span>
                        <span className="font-bold"> · </span>
                        {
                            asociation
                            ?
                            "Asociación"
                            :
                            <><b>Carné:</b> {message.autor.carnet}</>
                        }
                    </p>
                    <p>{localDateTime(message.timestamp, "full")}</p>
                </div>
                {
                    userType === "Administrador" ?
                    <button className="ml-auto" ><FontAwesomeIcon icon={faTrash} className=" text-red-500" onClick={toggleModal}/> </button>
                    : ""
                }
            </header>
            <div className="p-3 w-full">
                <div className="flex flex-row items-center">
                    <FontAwesomeIcon icon={faMessage} className="mr-2 text-venice-blue-800 self-start mt-[0.35rem]" />
                    <p>{message.contenido}</p>
                </div>
            </div>
            <Confirmation
                handleClose={toggleModal}
                handleConfirm={handleErase}
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


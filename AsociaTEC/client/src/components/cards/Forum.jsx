import { faGraduationCap, faBookBookmark, faCircleCheck, faXmarkCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Confirmation from "../modals/Confirmation";
import { useState } from "react";
import { localDateTime } from "../../utils/dateFormatter";

const Forum = ({ forum, userType, click, erase }) => {
    const navigate = useNavigate();
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    };

    const onClick = (e) => {
        e.preventDefault();
        click(e, forum.identificador)
    };
    const handleErase = (e) => {
        e.preventDefault();
        toggleModal()
        erase(e, forum.identificador)
    };
    console.log(userType)

    return (
        <div className="md:shadow-md border-b md:border-none md:my-2 md:rounded-xl p-3 flex flex-col md:flex-row md:items-center w-full">
            <div className="flex flex-row items-center space-x-2 justify-between w-full">
                <div className="flex flex-col grow">
                    <p
                        className="font-bold font-serif text-venice-blue-800 text-lg cursor-pointer" onClick={onClick}>
                        {forum.titulo}
                    </p>
                    <p><em><b>Publicado:</b> {localDateTime(forum.timestamp, "full")}</em></p>
                </div>
                {
                    userType === "Administrador" ? 
                    <FontAwesomeIcon className="text-xl text-red-700 cursor-pointer grow-0" icon={faTrash} onClick={toggleModal}/>
                    : null
                }
            </div>
            <Confirmation
                handleClose={toggleModal}
                handleConfirm={handleErase}
                title="Confirmar eliminación"
                message="¿Está seguro de que desea eliminar la conversación?"
                confirmationText="Eliminar"
                confirmColor="bg-red-600"
                modal={modal}
            />
        </div>
    )
};

export default Forum;
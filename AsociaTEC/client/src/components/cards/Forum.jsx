import { faGraduationCap, faBookBookmark, faCircleCheck, faXmarkCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Confirmation from "../modals/Confirmation";
import { useState } from "react";

const Forum = ({ forum, userType, click, errase }) => {
    const navigate = useNavigate();
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    };

    const onClick = (e) => {
        e.preventDefault();
        click(e, forum.identificador)
    };
    const handleErrase = (e) => {
        e.preventDefault();
        toggleModal()
        errase(e, forum.identificador)
    };
    console.log(userType)

    return (
        <div className="md:shadow-md border-b md:border-none md:m-2 md:rounded-xl p-3 flex flex-col md:flex-row md:items-center">
            <div className="flex flex-row items-center space-x-2">
                {userType === "Administrador" ? 
                <FontAwesomeIcon className="text-xl text-red-700 cursor-pointer" icon={faTrash} onClick={toggleModal}/>
                :""
                }
                <button
                    onClick={onClick}>
                    <p
                        className="font-bold font-serif text-venice-blue-800 text-lg">
                        {forum.titulo}
                    </p>
                </button>
            </div>
            <Confirmation
                handleClose={toggleModal}
                handleConfirm={handleErrase}
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
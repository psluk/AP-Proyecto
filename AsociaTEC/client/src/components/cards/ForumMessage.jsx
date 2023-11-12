import { faGraduationCap,faBookBookmark, faCircleCheck, faXmarkCircle} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import Confirmation from "../modals/Confirmation";
import { useState } from "react";

const ForumMessage = ({proposal, onDecline, onAccept }) => {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    };
    
    const goToDetail = (e) => {
        e.preventDefault();
        navigate(details);
    };
    const acceptProposal = (e) => {
        e.preventDefault();
        onAccept(proposal.id);
    };
    
    const declineProposal = () => {
        setModal(false);
        onDecline(proposal.id);
    };

    return (
        <div className="md:shadow-md border-b md:border-none md:m-2 md:rounded-xl p-3 flex flex-col md:flex-row md:items-center">
            <div className="grow">
                <a
                    href={details}
                    onClick={goToDetail}>
                        <p
                            className="font-bold font-serif text-venice-blue-800 text-lg">
                                {proposal.titulo}
                        </p>
                </a>
                <div className="flex flex-row items-center">
                    <FontAwesomeIcon icon={faBookBookmark} className="mr-2 text-venice-blue-800" />
                    <p><strong>Temática: </strong> {proposal.tematica}</p>
                </div>
                <div className="flex flex-row items-center">
                    <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-venice-blue-800" />
                    <p><strong>Objetivos: </strong>  {proposal.objetivos}</p>
                </div>
            </div>
            <div className="flex flex-row mt-2 md:mt-0 md:ml-2 md:flex-col grow-0 justify-around md:justify-center md:space-y-2">
                <button
                    onClick={acceptProposal}>
                        <FontAwesomeIcon className="text-xl text-venice-blue-800" icon={faCircleCheck} title="Modificar" />
                </button>
                <FontAwesomeIcon className="text-xl text-red-700 cursor-pointer" icon={faXmarkCircle} onClick={toggleModal} title="Eliminar" />
            </div>
            <Confirmation
                handleClose={toggleModal}
                handleConfirm={declineProposal}
                title="Confirmar eliminación"
                message="¿Está seguro de que desea rechazar la propuesta?"
                confirmationText="Eliminar"
                confirmColor="bg-red-600"
                modal={modal}
            />
        </div>
    )
};

export default ForumMessage;
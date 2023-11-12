import { faGraduationCap, faBookBookmark, faCircleCheck, faXmarkCircle, faPerson, faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import Confirmation from "../modals/Confirmation";
import { useEffect, useState } from "react";

const ForumMessage = ({ message }) => {
    const navigate = useNavigate();
    const [asociation, setAsociation] = useState(false);

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
        </div>
    )
};

export default ForumMessage;


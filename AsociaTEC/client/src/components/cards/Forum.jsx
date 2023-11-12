import { faGraduationCap,faBookBookmark, faCircleCheck, faXmarkCircle} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Confirmation from "../modals/Confirmation";
import { useState } from "react";

const Forum = ({forum, click}) => {
    const navigate = useNavigate();
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    };

    const onClick = (e) => {
        e.preventDefault();
        click(e, forum.identificador)
    };

    return (
        <div className="md:shadow-md border-b md:border-none md:m-2 md:rounded-xl p-3 flex flex-col md:flex-row md:items-center">
            <div className="grow">
                <button
                    onClick={onClick}>
                        <p
                            className="font-bold font-serif text-venice-blue-800 text-lg">
                                {forum.titulo}
                        </p>
                </button>
            </div>
        </div>
    )
};

export default Forum;
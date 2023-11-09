import { faPencil, faPeopleGroup, faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Confirmation from "../modals/Confirmation";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { localHtmlAttribute, localTime, localDate } from "../../utils/dateFormatter";

const EventCard = ({ event, onDelete, admin }) => {
    const navigate = useNavigate();
    const target = `/event/edit/${event.uuid}`;
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    };
    
    const goToDetail = (e) => {
        e.preventDefault();
        navigate(target);
    };

    const deleteEvent = () => {
        setModal(false);
        axios.delete(`/api/eventos/eliminar?uuid=${event.uuid}`)
            .then((res) => {
                toast.success("Evento eliminado con éxito", messageSettings);
                navigate("/events");
            })
            .catch((err) => {
                toast.error(err?.response?.data?.mensaje || defaultError, messageSettings);
            });
        onDelete(event.uuid);
    };

    return (
        <div className="sm:shadow-md border-b sm:border-none sm:m-2 sm:rounded-xl p-3 flex flex-col sm:flex-row sm:items-center">
            <div className="grow">
                <a
                    href={target}
                    onClick={goToDetail}>
                        <p
                            className="font-bold font-serif text-venice-blue-800 text-lg">
                                {event.titulo}
                        </p>
                </a>
                <div className="flex flex-row items-center">
                    <FontAwesomeIcon icon={faPeopleGroup} className="mr-2 text-venice-blue-800" />
                    <p>{event.asociacion.nombre}</p>
                </div>
                {/* Returns start and end date in the same string if it's the same day */}
                {
                    localHtmlAttribute(event.fechaInicio).split("T")[0] === localHtmlAttribute(event.fechaFin).split("T")[0]
                    ?
                    <div className="flex flex-row items-center">
                        <FontAwesomeIcon icon={faPlay} className="mr-2 text-emerald-600" />
                        <p>De <b>{localTime(event.fechaInicio, 'short')}</b> a <b>{localTime(event.fechaFin, 'short')}</b></p>
                    </div>
                    :
                    <>
                        <div className="flex flex-row items-center">
                            <FontAwesomeIcon icon={faPlay} className="mr-2 text-emerald-600" />
                            <p>De <b>{localTime(event.fechaInicio, 'short')}</b> a <b>{localTime(event.fechaFin, 'short')} ({localDate(event.fechaFin, 'short')})</b></p>
                        </div>
                    </>
                }
            </div>
            <div className="flex flex-row mt-2 sm:mt-0 sm:ml-2 sm:flex-col grow-0 justify-around sm:justify-center sm:space-y-2">
                {
                    admin ?
                    <>
                        <a
                            href={target}
                            onClick={goToDetail}>
                                <FontAwesomeIcon className="text-xl text-venice-blue-800" icon={faPencil} title="Modificar" />
                        </a>
                        <FontAwesomeIcon className="text-xl text-red-700 cursor-pointer" icon={faTrash} onClick={toggleModal} title="Eliminar" />
                    </>
                    :
                    <></>
                }
            </div>
            <Confirmation
                handleClose={toggleModal}
                handleConfirm={deleteEvent}
                title="Confirmar eliminación"
                message="¿Está seguro de que desea eliminar este evento?"
                confirmationText="Eliminar"
                confirmColor="bg-red-600"
                modal={modal}
            />
        </div>
    )
};

export default EventCard;
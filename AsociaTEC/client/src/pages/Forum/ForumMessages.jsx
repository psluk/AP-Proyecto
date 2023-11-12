import { useNavigate, useParams } from "react-router-dom";
import FormItems from "../../components/forms/FormItems";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import ForumMessage from "../../components/cards/ForumMessage";

const ForumMessages = () => {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [modal, setModal] = useState(false);
    const { getUserType, isLoggedIn, getEmail } = useSessionContext();
    const [proposal, setProposal] = useState([]);
    const [messages, setMessages] = useState([]);
    const [data, setData] = useState({});

    const toggleModal = () => {
        setModal(!modal);
    };

    const handleCreate = (e) => {
        e.preventDefault();

        axios.post(`/api/conversaciones/mensajes/agregar`, {
            uuid : uuid,
            contenido : data.contenido,
            correo : getEmail()
            }, { withCredentials: true })
        .then((response) => {

            toast.success("Mensaje publicado correctamente", messageSettings);
            toggleModal()
        })
        .catch((error) => {
            toast.error(error?.response?.data?.mensaje || "No se logró cargar los mensajes", messageSettings);
        });
    }


    // Load locations and association data
    useEffect(() => {

        if (!isLoggedIn) {
            navigate("/login");
            toast.error("Sesión no iniciada", messageSettings);
        }

        axios.get(`/api/conversaciones/mensajes?uuid=${uuid}`)
            .then((response) => {
                const prop = response.data
                console.log(prop)
                setMessages(prop)
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró cargar los mensajes", messageSettings);
            });

    }, []);

    useEffect(() => {

        axios.get(`/api/conversaciones/mensajes?uuid=${uuid}`)
            .then((response) => {
                const prop = response.data
                console.log(prop)
                setMessages(prop)
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró cargar los mensajes", messageSettings);
            });

    }, [modal]);

    //button (tarjetas de foro)
    // [ tarjetas de chat]

    //seccion medio de la lista de chats

    console.log(data)

    return (
        <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Foro
            </h1>
            {
                messages.length > 0
                    ? <div className="">{
                        messages.map((item, index) => (
                            <ForumMessage message={item} key={index}/>
                        ))
                    }</div>
                    : <p className="text-gray-600 italic text-center">Aun no hay mensajes</p>
            }
            <form className="space-y-4 flex flex-col items-center w-full" onSubmit={handleCreate}>
                <FormItems
                    fields={[{
                        label: "Contenido",
                        type: "textarea",
                        name: "contenido",
                        placeholder: "Ingrese el texto",
                        required: true,
                        rows: 5
                    }]}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <button
                    className=" bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                    type="submit"
                    key={"submit"}
                >
                    Enviar mensaje
                </button>
            </form>
        </div>
    );
};

export default ForumMessages;

/**



 */
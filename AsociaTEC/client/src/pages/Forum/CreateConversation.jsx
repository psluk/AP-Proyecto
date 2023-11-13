import { useNavigate, useParams } from "react-router-dom";
import FormItems from "../../components/forms/FormItems";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import { CreateConversationStructure } from "../../structures/Fields/CreateConversationStructure";

const CreateConversation = () => {
    const navigate = useNavigate();
    const { isLoggedIn, getEmail, getUserType } = useSessionContext();
    const [fields, setFields] = useState(CreateConversationStructure);
    const [data, setData] = useState({});

    const handleCreate = (e) => {
        e.preventDefault();
        const tags = [data.tag1 ? data.tag1 : "", data.tag2 ? data.tag2 : "", data.tag3 ? data.tag3 : ""]

        axios.post(`/api/conversaciones/agregar`, {
            titulo: data.titulo,
            tags: tags,
            correo: getEmail()
        }, { withCredentials: true })
            .then((response) => {

                toast.success("Conversación creada correctamente", messageSettings);
                navigate(`/forum`);
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
    }, []);

    return (
        <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Foro
            </h1>
            <form className="space-y-4 flex flex-col items-center w-full" onSubmit={handleCreate}>
                <FormItems
                    fields={fields}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <button
                    className="bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                    type="submit"
                    key="submit"
                >
                    Crear nueva Conversación
                </button>
            </form>

        </div>
    );
};

export default CreateConversation;
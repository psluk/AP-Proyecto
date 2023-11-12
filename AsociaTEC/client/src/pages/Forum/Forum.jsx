import { useNavigate, useParams } from "react-router-dom";
import FormItems from "../../components/forms/FormItems";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import Forum from "../../components/cards/Forum";

const ForumList = () => {
    const navigate = useNavigate();
    const { getUserType, isLoggedIn, getUniId } = useSessionContext();
    const [proposal, setProposal] = useState([]);
    const [forum, setForum] = useState([]);
    const [data, setData] = useState({});

    const onClick = (e, uuid) => {
        e.preventDefault();
        navigate(`/forum/conversation/${uuid}`)
    }

    const handleSearch = (e) => {
        e.preventDefault();
        console.log(data.titulo)
        axios.get(`/api/conversaciones?titulo=${data.titulo}`)
            .then((response) => {
                const prop = response.data
                setForum(prop)
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró cargar las conversaciones", messageSettings);
            });
    }

    const handleCreate = (e) => {
        e.preventDefault();
        navigate(`/forum/new_conversation`);
    }


    // Load locations and association data
    useEffect(() => {

        if (!isLoggedIn) {
            navigate("/login");
            toast.error("Sesión no iniciada", messageSettings);
        }

        axios.get(`/api/conversaciones/`)
            .then((response) => {
                const prop = response.data
                console.log(prop)
                setForum(prop)
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró cargar las conversaciones", messageSettings);
            });

    }, []);





    //barra buscadora -> form input
    // seccion medio donde se lista

    // hacer card para mostrar info

    //button (tarjetas de foro)
    // [ tarjetas de chat]

    //seccion medio de la lista de chats

    console.log(data)

    return (
        <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Foro
            </h1>
            <form className="space-y-4 flex flex-col items-center w-full" onSubmit={handleSearch}>
                <FormItems
                    fields={[{
                        label: "Título",
                        type: "text",
                        name: "titulo",
                        placeholder: "Título de la conversación",
                        required: false,
                        maxLength: 64,
                    }]}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <button
                    className=" bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                    type="submit"
                    key={"submit"}
                >
                    Buscar
                </button>
                <button
                    className=" bg-venice-blue-500 text-white py-2 px-4 rounded-lg w-fit"
                    onClick={handleCreate}>
                    Crear nueva Conversacion
                </button>
            </form>
            {
                forum.length > 0
                    ? <div className="">{
                        forum.map((item, index) => (
                            <Forum forum={item} key={index} click={onClick} />
                        ))
                    }</div>
                    : <p className="text-gray-600 italic text-center">Cargando...</p>
            }

        </div>
    );
};

export default ForumList;
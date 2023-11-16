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
    const [cambio, setCambio] = useState(true);
    const [forum, setForum] = useState([]);
    const [data, setData] = useState({});

    const toggleCambio = () => {
        setCambio(!cambio)
    }

    const onClick = (e, uuid) => {
        e.preventDefault();
        navigate(`/forum/conversation/${uuid}`)
    }

    const handleSearch = (e) => {
        e.preventDefault();
        console.log(data.titulo)
        axios.get(`/api/conversaciones?titulo=${data.titulo}`,{ withCredentials: true })
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

        if (!isLoggedIn()) {
            navigate("/login");
            toast.error("Sesión no iniciada", messageSettings);
            return;
        }
        navigate(`/forum/new_conversation`);
        
    }


    const handleErrase = (e, uuid) => {
        e.preventDefault()

        axios.delete(`/api/conversaciones/eliminar?uuid=${uuid}`,{ withCredentials: true })
            .then((response) => {
                const prop = response.data
                toast.success("Conversación eliminada", messageSettings);
                toggleCambio()
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró eliminar la conversación", messageSettings);
            });


    }

    // Load locations and association data
    useEffect(() => {

        //acceso libre

        setData({titulo: ""}) // en caso de busqueda vacia

        axios.get(`/api/conversaciones/`, { withCredentials: true })
            .then((response) => {
                const prop = response.data
                setForum(prop)
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró cargar las conversaciones", messageSettings);
            });

    }, []);

       // actualization post errased
       useEffect(() => {

        axios.get(`/api/conversaciones/`, { withCredentials: true })
            .then((response) => {
                const prop = response.data
                console.log("actualizacion",prop)
                setForum(prop)
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró cargar las conversaciones", messageSettings);
            });

    }, [cambio]);


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
                {getUserType() === "Administrador"? <div></div> :<button
                    className=" bg-venice-blue-500 text-white py-2 px-4 rounded-lg w-fit"
                    onClick={handleCreate}>
                    Crear nueva Conversacion
                </button>
                }
            </form>
            {
                forum.length > 0
                    ? <div className="">{
                        forum.map((item, index) => (
                            <Forum forum={item} userType={getUserType()} key={index} click={onClick} errase={handleErrase} />
                        ))
                    }</div>
                    : <p className="text-gray-600 italic text-center">Cargando...</p>
            }

        </div>
    );
};

export default ForumList;
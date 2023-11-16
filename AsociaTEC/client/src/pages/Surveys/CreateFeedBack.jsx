import { useNavigate, useParams } from "react-router-dom";
import FormItems from "../../components/forms/FormItems";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import { CreateSurvey } from "../../structures/Fields/CreateSurvey";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

const CreateFeedBack = () => {
    const navigate = useNavigate();
    const { isLoggedIn, getUniId } = useSessionContext();;
    const [isLoading, setIsLoading] = useState(false);
    const { uuid } = useParams();
    const [data, setData] = useState({
        calificacion: CreateSurvey[0].options[0].value,
        comentario: "",
    });


    const handleCreate = (e) => {
        e.preventDefault();

        if (!isLoggedIn()) {
            navigate("/login");
            toast.error("Sesión no iniciada", messageSettings);
            return
        } 

        axios.post('/api/encuestas/agregar',
            {
                evento: uuid,
                carnet: getUniId(),
                calificacion: data.calificacion,
                comentario: data.comentario
            },
            { withCredentials: true }).then((res) => {
                toast.success("Retroalimentación enviada exitosamente", messageSettings);
                navigate(`/my-events`);//falta de donde viene
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });
    }

    // Load locations and association data
    useEffect(() => {

        if (!isLoggedIn()) {
            navigate("/login");
            toast.error("Sesión no iniciada", messageSettings);
        }

        axios.get(`/api/eventos/detalles?uuid=${uuid}`,{ withCredentials: true }).then((res) => {
            setIsLoading(true);
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
                navigate(-1);
            });
    }, []);

    return (
        <>
            {
                isLoading
                ? 
                <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
                    <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                        Retroalimentación
                    </h1>
                    <form className="space-y-4 flex flex-col items-center w-full" onSubmit={handleCreate}>
                        <FormItems
                            fields={CreateSurvey}
                            formItemsData={data}
                            setFormItemsData={setData}
                        />
                        <button
                            className=" bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                            type="submit"
                            key={"submit"}
                        >
                            Enviar
                        </button>
                    </form>
                </div>
                :
                <div className="flex flex-col md:w-[24rem] lg:w-[48rem] 2xl:w-[72rem]">
                    <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles" />
                </div>
            }
        </>
    );
};

export default CreateFeedBack;
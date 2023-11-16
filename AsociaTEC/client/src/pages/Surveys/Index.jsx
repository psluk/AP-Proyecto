import { useNavigate, useParams } from "react-router-dom";
import FormItems from "../../components/forms/FormItems";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

const FeedBackList = () => {
    const navigate = useNavigate();
    const { getUserType, isLoggedIn, getUniId } = useSessionContext();
    const [survey, setSurvey] = useState([]);
    const [event, setEvent] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { uuid } = useParams();

    // Load locations and association data
    useEffect(() => {

        if (!isLoggedIn()) {
            navigate("/login");
            toast.error("Sesión no iniciada", messageSettings);
        }

        if (getUserType() === 'Estudiante') {
            navigate("/");
            toast.error("No tiene los permisos necesarios", messageSettings);
        }

        axios.get(`/api/encuestas?evento=${uuid}`, { withCredentials: true }).then((res) => {
            setSurvey(res.data)
            setIsLoading(false);
        })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.mensaje || defaultError,
                    messageSettings
                );
            });
    }, []);

    const goToStats = (e) =>{
        e.preventDefault()
        navigate(`/event/stats/${uuid}`)
    }

    return (
        <>
            <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
                <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                    Retroalimentaciones
                </h1>
                <button className="bg-venice-blue-700 text-white p-2 rounded-lg mb-4'" onClick={goToStats}>Ver estadisticas</button>
                {
                    survey.length > 0
                    ?
                    <div className={`rounded-xl ${survey.length ? 'border' : ''} overflow-hidden shadow-lg`}>
                        <table className='text-center table-auto'>
                            <thead className='font-serif text-center text-venice-blue-800 md:text-lg bg-gray-100 '>
                                <tr className="[&>th]:px-2 md:[&>th]:px-8 [&>th]:py-2">
                                    <th>Calificación</th>
                                    <th>Comentario</th>
                                </tr>
                            </thead>
                            <tbody className="[&>tr:last-child]:border-b-0">
                                {survey.map((item, index) => {
                                    return (
                                        <tr key={index} className='bg-white border-b-2 border-venice-blue-800 [&>td]:px-2 [&>td]:py-2'>
                                            <td>{`${item.encuesta.calificacion}`}</td>
                                            {
                                                item.encuesta.comentario
                                                ?
                                                <td>{`${item.encuesta.comentario}`}</td>
                                                :
                                                <td className="text-gray-500 italic">Sin comentarios</td>
                                            }
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    :
                    <div className="flex flex-col md:w-[24rem] lg:w-[48rem] 2xl:w-[72rem]">
                        {
                            isLoading
                                ?
                                <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles" />
                                :
                                <p className="text-center text-gray-400 text-xl font-serif font-bold my-3">No hay encuestas</p>
                        }
                    </div>
                }
            </div>
        </>
    );
};

export default FeedBackList;
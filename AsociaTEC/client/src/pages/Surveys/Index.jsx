import { useNavigate, useParams } from "react-router-dom";
import FormItems from "../../components/forms/FormItems";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import Forum from "../../components/cards/Forum";
import { CreateSurvey } from "../../structures/Fields/CreateSurvey";
import { Stars } from "../../structures/Fields/Stars";

const FeedBackList = () => {
    const navigate = useNavigate();
    const { getUserType, isLoggedIn, getUniId } = useSessionContext();
    const [survey, setSurvey] = useState([]);
    const [event, setEvent] = useState(false);
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

        axios.get(`/api/eventos/detalles?uuid=${uuid}`, { withCredentials: true }).then((res) => {
            setEvent(true)
        }).catch((err) => {
            setEvent(false)
        });

        axios.get(`/api/encuestas?evento=${uuid}`, { withCredentials: true }).then((res) => {

            setSurvey(res.data)

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
            {
            event
            ?
            <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
                <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                    Retroalimentaciones
                </h1>
                <button className="bg-venice-blue-700 text-white p-2 rounded-lg mb-4'" onClick={goToStats}>Ver estadisticas</button>
                <table className='text-center table-auto md:table-fixed shadow-lg '>
                    <thead className=' text-center text-venice-blue-700 md:text-lg bg-gray-100 '>
                        <tr className="[&>th]:px-2 md:[&>th]:px-8 [&>th]:py-2">
                            <th>Calificación</th>
                            <th>Comentario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {survey.map((item, index) => {
                            return (
                                <tr key={index} className='bg-white border-b-2 border-venice-blue-200 [&>td]:px-2 [&>td]:py-2'>
                                    <td>{`${item.encuesta.calificacion}`}</td>
                                    <td >{item.encuesta.comentario}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            :
            <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
                <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                    Evento no existente
                </h1>
            </div>
            }
        </>
    );
};

export default FeedBackList;
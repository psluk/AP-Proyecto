import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

const ProposalDetails = () => {
    const { uuid } = useParams();
    const { getUserType, isLoggedIn } = useSessionContext();
    const [proposal, setProposal] = useState(null);
    const navigate = useNavigate();

    const setNewValues = (text) => {

        axios.put("/api/propuestas/modificar", { propuesta: uuid, estado: text }, { withCredentials: true })
            .then((response) => {
                toast.success("Propuesta modificada correctamente", messageSettings);
                navigate(-1);
            })
            .catch((error) => {
                console.log(error)
                toast.error(error?.response?.data?.mensaje || "No se logró modificar la propuesta", messageSettings);
            });
    }

    const accept = (e) => {
        e.preventDefault();
        setNewValues("Aceptada")

    }
    const decline = (e) => {
        e.preventDefault();
        setNewValues("Rechazada")

    }


    // Load locations and association data
    useEffect(() => {
        console.log(uuid)
        axios.get(`/api/propuestas/detalles/?propuesta=${uuid}`, { withCredentials: true })
            .then((response) => {
                const prop = response.data[0]
                setProposal(prop)
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se logró cargar la propuesta", messageSettings);
            });

    }, [uuid]);



    return (
        <div className="p-5 w-full sm:w-[40rem] space-y-4 flex flex-col items-center">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                Propuesta
            </h1>
            {
                proposal
                ?
                <>
                    <ul className="flex flex-col space-y-2">
                        {proposal.id ? <li><b>ID Propuesta: </b> {proposal.id}</li> : <></>}
                        {proposal.titulo ? <li><b>Título: </b> {proposal.titulo}</li> : <></>}
                        {proposal.tematica ? <li><b>Temática: </b> {proposal.tematica}</li> : <></>}
                        {proposal.objetivos ? <li><b>Objetivos: </b> {proposal.objetivos}</li> : <></>}
                        {proposal.actividades ? <li><b>Actividades: </b> {proposal.actividades}</li> : <></>}
                        {proposal.otros ? <li><b>Otros: </b> {proposal.otros}</li> : <></>}
                    </ul>
                    <div className="space-x-2">
                        <button
                            className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-lg w-fit"
                            type="button"
                            key="logout"
                            onClick={accept}
                        >
                            Aceptar
                        </button>
                        <button
                            className="bg-red-600 hover:bg-red-800 text-white py-2 px-4 rounded-lg w-fit"
                            type="button"
                            key="logout"
                            onClick={decline}
                        >
                            Rechazar
                        </button>
                    </div>
                </>
                : <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles"/>
            }
        </div>
    );
};

export default ProposalDetails;
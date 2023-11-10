import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { messageSettings } from "../../utils/messageSettings";
import AssociationCard from "../../components/cards/Association";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";

const AssociationList = () => {
    const [associations, setAssociations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const deleteAssociation = (location, career) => {
        setAssociations((prev) => prev.filter((association) => association.carrera.codigo !== career || association.sede.codigo !== location));
    };
    
    // Loading the data
    useEffect(() => {
        axios.get("/api/asociaciones")
            .then((response) => {
                setAssociations(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se pudieron cargar las asociaciones", messageSettings);
            });
    }, []);

    return (
        <div className="py-5 sm:px-5 w-full md:px-12 lg:px-20 flex-auto">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold my-6">
                Asociaciones
            </h1>
            {
                associations.length > 0
                ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">{
                    associations.map((association, index) => (
                        <AssociationCard association={association} key={index} onDelete={deleteAssociation} />
                    ))
                }</div>
                : 
                <div className="flex flex-col">
                    {
                        isLoading
                        ?
                        <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles"/>
                        :
                        <p className="text-center text-gray-400 text-xl font-serif font-bold my-3">No hay asociaciones</p>
                    }
                </div>
            }
        </div>
    )
};

export default AssociationList;
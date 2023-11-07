import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { messageSettings } from "../../utils/messageSettings";
import AssociationCard from "../../components/cards/Association";

const AssociationList = () => {
    const [associations, setAssociations] = useState([]);

    const deleteAssociation = (location, career) => {
        setAssociations((prev) => prev.filter((association) => association.carrera.codigo !== career || association.sede.codigo !== location));
    };
    
    // Loading the data
    useEffect(() => {
        axios.get("/api/asociaciones")
            .then((response) => {
                setAssociations(response.data);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.mensaje || "No se pudieron cargar las asociaciones", messageSettings);
            });
    }, []);

    return (
        <div className="py-5 sm:px-5 w-full md:px-12 lg:px-20 flex-auto">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Asociaciones
            </h1>
            {
                associations.length > 0
                ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">{
                    associations.map((association, index) => (
                        <AssociationCard association={association} key={index} onDelete={deleteAssociation} />
                    ))
                }</div>
                : <p className="text-gray-600 italic text-center">Cargando...</p>
            }
        </div>
    )
};

export default AssociationList;
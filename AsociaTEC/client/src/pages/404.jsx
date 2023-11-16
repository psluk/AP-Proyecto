import { faFaceSadTear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NotFound = () => {
    return (
        <>
            <div className="p-5 w-full sm:w-[40rem] space-y-6 flex flex-col items-center">
                <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold">
                    Error 404
                </h1>
                <p>
                    La página que está buscando no existe
                </p>
                <FontAwesomeIcon icon={faFaceSadTear} className="text-9xl text-gray-400" />
            </div>
        </>
    );
};

export default NotFound;
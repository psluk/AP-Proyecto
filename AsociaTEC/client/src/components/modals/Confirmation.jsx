import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Confirmation = ({ handleClose, handleConfirm, title, message, confirmationText, confirmColor, modal }) => {
    const hoverColor = confirmColor.split("-").slice(0, 2).join("-") + "-" + (parseInt(confirmColor.split("-").pop()) + 100)
    return (
        <>
          {
            modal && (
                <div className="w-screen h-screen top-0 left-0 right-0 bottom-0 fixed z-[100]">
                <div
                    onClick={handleClose}
                    className="w-screen h-screen top-0 left-0 right-0 bottom-0 fixed z-[100] bg-gray-800 opacity-60 cursor-default"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-md rounded-md z-[102] w-full max-w-sm py-6 px-4 pt-8" onClick={(e) => {e.preventDefault()}}>
                    <div className="content">
                    <h4 className="w-full text-center font-medium text-xl">
                        {title}
                    </h4>
                    <p className="w-full text-center my-7">{message}</p>
                    </div>
                    <div className="flex mt-5 justify-center gap-3">
                    <button
                        className="bg-transparent hover:bg-gray-300 border-2 border-gray-700 py-2 px-4 text-base rounded-md cursor-pointer text-gray-700 transition-opacity"
                        onClick={handleClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className={`${confirmColor} hover:${hoverColor} py-2 px-4 text-base rounded-md cursor-pointer text-white transition-colors`}
                        onClick={handleConfirm}
                    >
                        {confirmationText}
                    </button>
                    </div>
                    <button
                    className="absolute top-2 right-2 text-slate-700 cursor-pointer"
                    onClick={handleClose}
                    >
                    <FontAwesomeIcon icon={faCircleXmark} className="text-venice-blue-800" />
                    </button>
                </div>
                </div>
            )
          }
        </>
      );
}

export default Confirmation;
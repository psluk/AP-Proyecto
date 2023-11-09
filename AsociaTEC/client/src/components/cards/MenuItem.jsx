import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const MenuItemCard = ({ option }) => {
    const color = option.color || "#029ef5"; // bg-venice-blue-500
    const hoverColor = option.colorOnHover || "#007dd2" // bg-venice-blue-600

    const showFocus = () => {
        document.getElementById(option.path).style.backgroundColor = hoverColor;
    };

    const removeFocus = () => {
        document.getElementById(option.path).style.backgroundColor = color;
    };

    return (
        <Link to={ option.path }>
            <div
                    id={option.path}
                    onMouseOver={showFocus} onMouseOut={removeFocus}
                    className={`m-3 flex flex-col rounded-xl items-center p-2 w-[8rem] md:w-[9rem] xl:w-[10rem] shadow-lg h-[8rem] md:h-[9rem] xl:h-[10rem] justify-center transition-all`} style={{ backgroundColor: color }}>
                <h2 className="text-white font-bold bg-opacity-0">{ option.name }</h2>
                <FontAwesomeIcon className="text-white m-5 text-4xl md:text-5xl xl:text-6xl" icon={ option.icon } />
            </div>
        </Link>
    )
};

export default MenuItemCard;
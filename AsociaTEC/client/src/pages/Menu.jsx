import logo from "../assets/images/darkLogo.svg";
import { MenuOptions } from "../structures/MenuOptions";
import MenuItemCard from "../components/cards/MenuItem";
import { useSessionContext } from "../context/SessionComponent";

const Menu = () => {
    const { getUserType } = useSessionContext();
    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-row items-center space-x-2 md:space-x-3 xl:space-x-4 mb-16">
                <img src={logo} className="h-12 md:h-16 xl:h-[5rem]" />
                <h1 className="font-serif text-4xl md:text-5xl xl:text-6xl text-venice-blue-800 font-bold uppercase">AsociaTEC</h1>
            </div>

            <div className="flex flex-row w-full flex-wrap justify-center">
                {
                    MenuOptions[getUserType() || "guest"].filter((option) => option.showInMenu).map((option, index) => (
                        <MenuItemCard key={index} option={option} />
                    ))
                }
            </div>
        </div>
    )
};

export default Menu;
import logo from "../assets/images/lightLogo.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useSessionContext } from "../context/SessionComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTimes, faBars } from "@fortawesome/free-solid-svg-icons";
import { MenuOptions } from "../structures/MenuOptions";

const NavBar = () => {
    const navigate = useNavigate();
    const { isLoggedIn, getUserType } = useSessionContext();
    const [open, setOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="w-full bg-venice-blue-800 py-2 lg:px-10 px-5 flex justify-center text-white sticky top-0 h-14">
            {/* Doing lg:w-[75rem] to keep the nav. bar in a reasonable size even in wider screens */}
            <div className="flex flex-row items-center w-full lg:w-[75rem] justify-between">
                {/* Elements on the left */}
                <div
                    className={`flex flex-row items-center transition-all duration-500 ease-in-out ${location.pathname !== "/" ? "opacity-100 transform translate-y-0 cursor-pointer" : "opacity-0 -translate-y-10"}`}
                    onClick={() => {
                        navigate("/");
                    }}
                >
                    <img src={logo} alt="Logo AsociaTEC" className="h-8 lg:h-10" />
                    <p className="uppercase font-serif text-xl md:text-lg lg:text-2xl font-bold ml-2">
                        AsociaTEC
                    </p>
                </div>
                {/* Elements on the right */}
                <div className="flex flex-row items-center space-x-10 font-bold">
                    {/* Links */}
                        <div
                            className={`transition-all bg-venice-blue-800 bg-opacity-90 backdrop-blur-sm py-5 space-y-5 w-screen fixed left-0 ${open ? "bottom-0" : "bottom-full"} flex flex-col md:flex-row items-center md:space-x-10 md:space-y-0 font-bold md:w-auto md:static md:py-0`}>
                            {
                                MenuOptions[getUserType() || "guest"].map((option, index) => (
                                    <a
                                        key={index}
                                        className={`cursor-pointer hover:text-slate-300 transition-all duration-500 ease-in-out ${location.pathname !== "/" ? "opacity-100 transform" : "opacity-0 -translate-y-10"}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setOpen(false);
                                            navigate(option.path);
                                        }}
                                        href={option.path}
                                    >
                                        {option.name}
                                    </a>
                                ))
                            }
                            {
                                isLoggedIn() ? (
                                    <FontAwesomeIcon
                                        className="text-venice-blue-800 bg-white hover:bg-slate-300 p-2 rounded-lg cursor-pointer"
                                        onClick={() => {
                                            setOpen(false);
                                            navigate("/profile");
                                        }}
                                        icon={faUser}
                                    />
                                ) : (
                                    <a
                                        href="/login"
                                        className="font-normal py-1 px-2 text-venice-blue-800 bg-white hover:bg-slate-300 rounded-lg"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setOpen(false);
                                            navigate(e.target.getAttribute("href"));
                                        }}
                                    >
                                        Iniciar sesión
                                    </a>
                                )
                            }
                        </div>
                    {/* Hamburger menu */}
                    <FontAwesomeIcon className="md:hidden" icon={open ? faTimes : faBars} onClick={() => setOpen(!open)} />
                </div>
            </div>
        </div>
    );
};

export default NavBar;

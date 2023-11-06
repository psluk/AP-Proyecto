import logo from "../assets/images/logo.svg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSessionContext } from "../context/SessionComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTimes, faBars } from "@fortawesome/free-solid-svg-icons";

const OPTIONS = {
    guest: [
        {
            name: "Inicio",
            path: "/",
        },
        {
            name: "Eventos",
            path: "/events",
        },
        {
            name: "Foro",
            path: "/forum",
        }
    ],
    Estudiante: [
        {
            name: "Inicio",
            path: "/",
        },
        {
            name: "Eventos",
            path: "/events",
        },
        {
            name: "Mis eventos",
            path: "/my-events",
        },
        {
            name: "Foro",
            path: "/forum",
        }
    ],
    Administrador: [
        {
            name: "Inicio",
            path: "/",
        },
        {
            name: "Eventos",
            path: "/events",
        },
        {
            name: "Foro",
            path: "/forum",
        },
        {
            name: "Estudiantes",
            path: "/students",
        },
        {
            name: "Asociaciones",
            path: "/associations",
        },
    ],
    Asociación: [
        {
            name: "Inicio",
            path: "/",
        },
        {
            name: "Eventos",
            path: "/events",
        },
        {
            name: "Propuestas",
            path: "/proposals",
        },
        {
            name: "Foro",
            path: "/forum",
        }
    ],
};

const NavBar = () => {
    const navigate = useNavigate();
    const { getName, getEmail, getUniId, isLoggedIn, getUserType } = useSessionContext();
    const [open, setOpen] = useState(false);

    return (
        <div className="w-full bg-venice-blue-800 py-2 lg:px-10 px-5 flex justify-center text-white sticky top-0">
            {/* Doing lg:w-[75rem] to keep the nav. bar in a reasonable size even in wider screens */}
            <div className="flex flex-row items-center w-full lg:w-[75rem] justify-between">
                {/* Elements on the left */}
                <div
                    className="flex flex-row items-center cursor-pointer"
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
                    <div className={`transition-all bg-venice-blue-800 bg-opacity-90 backdrop-blur-sm py-5 space-y-5 w-screen fixed left-0 ${open ? "bottom-0" : "bottom-full"} flex flex-col md:flex-row items-center md:space-x-10 md:space-y-0 font-bold md:w-auto md:static md:py-0`}>
                        {
                            OPTIONS[getUserType() || "guest"].map((option, index) => (
                                <a
                                    key={index}
                                    className="cursor-pointer hover:text-slate-300"
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
                                        navigate("/login");
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

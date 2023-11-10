import {
    faCalendar, faComments, faCalendarCheck, faUsers, faPeopleGroup, faListCheck
} from "@fortawesome/free-solid-svg-icons";
import colors from "tailwindcss/colors";

export const MenuOptions = {
    guest: [
        {
            name: "Inicio",
            path: "/",
            showInMenu: false,
        },
        {
            name: "Eventos",
            path: "/events",
            showInMenu: true,
            icon: faCalendar,
            color: colors.emerald[400],
            colorOnHover: colors.emerald[500],
        },
        {
            name: "Foro",
            path: "/forum",
            showInMenu: true,
            icon: faComments,
            color: colors.blue[400],
            colorOnHover: colors.blue[500],
        },
    ],
    Estudiante: [
        {
            name: "Inicio",
            path: "/",
            showInMenu: false,
        },
        {
            name: "Eventos",
            path: "/events",
            showInMenu: true,
            icon: faCalendar,
            color: colors.emerald[400],
            colorOnHover: colors.emerald[500],
        },
        {
            name: "Mis eventos",
            path: "/my-events",
            showInMenu: true,
            icon: faCalendarCheck,
            color: colors.fuchsia[400],
            colorOnHover: colors.fuchsia[500],
        },
        {
            name: "Foro",
            path: "/forum",
            showInMenu: true,
            icon: faComments,
            color: colors.blue[400],
            colorOnHover: colors.blue[500],
        },
    ],
    Administrador: [
        {
            name: "Inicio",
            path: "/",
            showInMenu: false,
        },
        {
            name: "Eventos",
            path: "/events",
            showInMenu: true,
            icon: faCalendar,
            color: colors.emerald[400],
            colorOnHover: colors.emerald[500],
        },
        {
            name: "Foro",
            path: "/forum",
            showInMenu: true,
            icon: faComments,
            color: colors.blue[400],
            colorOnHover: colors.blue[500],
        },
        {
            name: "Estudiantes",
            path: "/students",
            showInMenu: true,
            icon: faUsers,
            color: colors.fuchsia[400],
            colorOnHover: colors.fuchsia[500],
        },
        {
            name: "Asociaciones",
            path: "/associations",
            showInMenu: true,
            icon: faPeopleGroup,
            color: colors.indigo[400],
            colorOnHover: colors.indigo[500],
        },
    ],
    Asociación: [
        {
            name: "Inicio",
            path: "/",
            showInMenu: false,
        },
        {
            name: "Eventos",
            path: "/events",
            showInMenu: true,
            icon: faCalendar,
            color: colors.emerald[400],
            colorOnHover: colors.emerald[500],
        },
        {
            name: "Propuestas",
            path: "/proposals",
            showInMenu: true,
            icon: faListCheck,
            color: colors.indigo[400],
            colorOnHover: colors.indigo[500],
        },
        {
            name: "Foro",
            path: "/forum",
            showInMenu: true,
            icon: faComments,
            color: colors.blue[400],
            colorOnHover: colors.blue[500],
        },
    ],
};

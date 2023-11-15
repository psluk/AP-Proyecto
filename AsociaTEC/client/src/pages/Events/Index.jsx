import {
    DateCalendar,
    LocalizationProvider,
    PickersDay
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Badge from "@mui/material/Badge";
import "dayjs/locale/es";
import React, { useState, useRef, useEffect } from "react";
import { currentLocalHtmlAttribute, localHtmlAttribute, localDate } from "../../utils/dateFormatter";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings } from "../../utils/messageSettings";
import EventCard from "../../components/cards/Event";
import ReactLoading from "react-loading";
import colors from "tailwindcss/colors";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "../../context/SessionComponent";

const EventList = () => {
    const requestAbortController = useRef(null);
    const [date, setDate] = useState(
        dayjs(currentLocalHtmlAttribute().split("T")[0])
    );
    const [isLoading, setIsLoading] = useState(false);
    const [month, setMonth] = useState(
        dayjs(
            currentLocalHtmlAttribute()
                .split("T")[0]
                .replace(/\d{2}$/, "01")
        )
    );

    const [daysWithEvents, setDaysWithEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const navigate = useNavigate();
    const { getUserType, getLocationCode, getCareerCode } = useSessionContext();
    const admin = getUserType() === "Administrador";
    const assoc = getUserType() === "Asociación";
    const [ownEvents, setOwnEvents] = useState(false);

    const deleteEvent = (uuid) => {
        let currentEvents = [...events];

        currentEvents = currentEvents.map((date) => {
            return {
                ...date,
                events: date.events.filter((event) => event.uuid !== uuid),
            };
        });

        setEvents(currentEvents.filter((date) =>
            date.events.length > 0
        ));
    };

    useEffect(() => {
        if (initialLoad) {
            setInitialLoad(false);
            return;
        }

        const targetElement = document.getElementById(date.toISOString().split("T")[0]);
        if (targetElement) {
            const targetPosition = targetElement.offsetTop - 65;
            window.scrollTo({ top: targetPosition, behavior: "smooth" });
        }
    }, [date]);

    const ServerDay = (props) => {
        const {
            highlightedDays = [],
            day,
            outsideCurrentMonth,
            ...other
        } = props;

        const isSelected =
            !props.outsideCurrentMonth &&
            highlightedDays.indexOf(props.day.date()) >= 0;

        return (
            <Badge
                key={props.day.toString()}
                overlap="circular"
                badgeContent={isSelected ? "⬤" : undefined}
                className="text-emerald-500"
            >
                <PickersDay
                    {...other}
                    outsideCurrentMonth={outsideCurrentMonth}
                    day={day}
                    className="bg-venice-blue-700"
                />
            </Badge>
        );
    };

    const fetchEvents = () => {
        const controller = new AbortController();
        setEvents([]);

        const ruta = ownEvents ? `/api/eventos?fechaInicio=${month.toISOString()}&fechaFin=${month
            .add(1, "month")
            .toISOString()}&codigoSede=${getLocationCode()}&codigoCarrera=${getCareerCode()}` 
            : `/api/eventos?fechaInicio=${month.toISOString()}&fechaFin=${month
                .add(1, "month")
                .toISOString()}`

        axios
            .get(
                ruta,
                {
                    withCredentials: true,
                    signal: controller.signal,
                }
            )
            .then((response) => {
                // Groups the events by date
                const newEvents = [];
                response.data.map((event) => {
                    const currentStartDateString = localHtmlAttribute(event.fechaInicio).split("T")[0];
                    if (!newEvents.find((date) => date.date === currentStartDateString)) {
                        newEvents.push({
                            date: currentStartDateString,
                            events: [event],
                        });
                    } else {
                        newEvents.find((date) => date.date === currentStartDateString).events.push(event);
                    }
                });

                setEvents(newEvents);

                setIsLoading(false);
            })
            .catch((error) => {
                if (
                    error.name === "AbortError" ||
                    error.name === "CanceledError"
                ) {
                    // if the request was aborted, it means that the user switched months
                    // so we don't want to update the state
                    return;
                }
                setIsLoading(false);
                toast.error(
                    error?.response?.data?.mensaje ||
                    "No se pudieron cargar los eventos",
                    messageSettings
                );
            });

        requestAbortController.current = controller;
    };

    useEffect(() => {
        const currentMonthString = month.add(dayjs().utcOffset() * -1, "minute").toISOString().split(".")[0];
        setDaysWithEvents(
            events.map((date) => {
                if (date.date >= currentMonthString) {
                    return parseInt(date.date.split("-").at(-1));
                }
            })
        );
    }, [events]);

    useEffect(() => {
        if (requestAbortController.current) {
            // Making sure to abort the previous request
            // because it is possible to switch between months pretty quickly
            requestAbortController.current.abort();
        }

        setIsLoading(true);
        setDaysWithEvents([]);
        fetchEvents();
    }, [month, ownEvents]);



    const fetchOwnEvents = () => {
        setOwnEvents(!ownEvents);
    };


    return (
        <div className="flex flex-col w-full sm:w-fit flex-auto">
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold my-6">Eventos</h1>
            <div className="flex flex-col md:flex-row w-full px-6 h-full">
                <div className="grow-0 md:mr-6 flex flex-col self-center md:self-start items-center">
                    {
                        assoc &&
                        <div className="flex gap-2">
                            <button
                                className="bg-emerald-500 hover:bg-emerald-600 py-2 px-4 rounded-lg w-fit text-white mt-3"
                                onClick={() => navigate("/event/create")} >Crear evento</button>
                            <button
                                className="bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg w-fit text-white mt-3"
                                onClick={() => fetchOwnEvents()} >{ownEvents ? 'Ver todos' : 'Ver mis eventos'}</button>
                        </div>

                    }
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                        <DateCalendar
                            value={date}
                            onChange={(newDate) => setDate(newDate)}
                            loading={isLoading}
                            onMonthChange={(newMonth) => setMonth(newMonth)}
                            onYearChange={(newMonth) => setMonth(newMonth)}
                            slots={{
                                day: ServerDay,
                            }}
                            slotProps={{
                                day: {
                                    highlightedDays: daysWithEvents,
                                },
                            }}
                        />
                    </LocalizationProvider>
                </div>
                <div className="flex flex-col items-center grow">
                    <h2 className="text-center text-venice-blue-700 font-serif text-3xl font-bold mt-3 md:mt-0">{localDate(month?.toISOString(), 'month', true)}</h2>
                    {
                        events.length
                            ?
                            <div className="flex flex-col w-full">
                                {
                                    events.map((date) => {
                                        return (
                                            <div className="flex flex-col w-full lg:flex-auto" key={date.date}>
                                                <h3
                                                    id={date.date}
                                                    className="text-center text-xl font-serif text-venice-blue-600 font-bold my-4">
                                                    {localDate(date.events[0].fechaInicio, 'long')}
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl-grid-cols-3 w-full">
                                                    {
                                                        date.events.map((event) => {
                                                            return (
                                                                <EventCard key={event.uuid} event={event} onDelete={deleteEvent} admin={admin} userType={getUserType()} />
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                            :
                            <div className="flex flex-col md:w-[23rem] lg:w-[40rem] 2xl:w-[43.5rem]">
                                {
                                    isLoading
                                        ?
                                        <ReactLoading className="self-center grow" color={colors.gray[400]} type="bubbles" />
                                        :
                                        <p className="text-center text-gray-400 text-xl font-serif font-bold my-3">No hay eventos</p>
                                }
                            </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default EventList;

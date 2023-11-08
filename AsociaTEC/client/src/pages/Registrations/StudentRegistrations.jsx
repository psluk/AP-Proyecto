import React from 'react'
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { messageSettings, defaultError } from "../../utils/messageSettings";
import { useSessionContext } from "../../context/SessionComponent";
import Registration from "../../components/cards/Registration";

const StudentRegistrations = () => {
    return (
        <div className='p-5 w-full md:w-2/4 md:flex md:flex-col mb-6'>
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Inscripciones
            </h1>
            <div className='grid md:grid-cols-2 gap-2 items-center'>
                <Registration nombre='Evento 1' inicio='2021-10-10' fin='2021-10-11' estado={false}/>
                <Registration nombre='Evento 2' inicio='2021-10-10' fin='2021-10-11' estado={true}/>
                <Registration nombre='Evento 3' inicio='2021-10-10' fin='2021-10-11' estado={false}/>
                <Registration nombre='Evento 4' inicio='2021-10-10' fin='2021-10-11' estado={true}/>
                <Registration nombre='Evento 5' inicio='2021-10-10' fin='2021-10-11' estado={false}/>
                <Registration nombre='Evento 6' inicio='2021-10-10' fin='2021-10-11' estado={true}/>

            </div>
        </div>
    )
}

export default StudentRegistrations;
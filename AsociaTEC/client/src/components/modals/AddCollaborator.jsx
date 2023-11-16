import React from 'react'
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { messageSettings, defaultError } from '../../utils/messageSettings';

const AddCollaboratorModal = ({ handleClose, handleConfirm, modal, setCarnet, setDescripcion }) => {


    return (
        <>
            {modal && (
                <div className="w-screen h-screen top-0 left-0 right-0 bottom-0 fixed z-[100]">
                    <div
                        className='w-screen h-screen top-0 left-0 right-0 bottom-0 fixed z-[100] bg-gray-800 opacity-60 cursor-default'
                        onClick={handleClose}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-md rounded-md z-[102] w-full max-w-sm py-6 px-4 pt-8" onClick={(e) => { e.preventDefault() }}>
                        <div className='flex flex-col items-center'>
                            <h4 className="w-full text-center font-medium text-xl">
                                Añadir colaborador
                            </h4>
                            <label>Digite el carné</label>
                            <input
                                onChange={(e) => setCarnet(e.target.value)}
                                type="text" className="py-1 px-2 border border-venice-blue-700 rounded-lg bg-gray-50" />
                            <label className='mt-2'>Descripción</label>
                            <input
                                onChange={(e) => setDescripcion(e.target.value)}
                                type="text" className="py-1 px-2 border border-venice-blue-700 rounded-lg bg-gray-50" />
                        </div>
                        <div className="flex mt-5 justify-center gap-3">
                            <button
                                className="bg-transparent hover:bg-gray-300 border-2 border-gray-700 py-2 px-4 text-base rounded-md cursor-pointer text-gray-700 transition-opacity"
                                onClick={handleClose}
                            >
                                Cerrar
                            </button>
                            <button
                                className={`bg-venice-blue-700 hover:bg-venice-blue-500 py-2 px-4 text-base rounded-md cursor-pointer text-white transition-colors`}
                                onClick={handleConfirm}
                            >
                                Añadir
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
            )}
        </>
    )
}

export default AddCollaboratorModal

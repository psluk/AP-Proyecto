import React from 'react'
import FormItems from '../../structures/FormItems'
import { Form } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { messageSettings, defaultError } from '../../utils/messageSettings'
import { EventStructure } from '../../structures/CreateEvent'

export default function CreateEvent() {

    const options = [
        { value: 'Option 1', label: 'Option 1' },
        { value: 'Option 2', label: 'Option 2' },
        { value: 'Option 3', label: 'Option 3' },
    ]

    const [data, setData] = useState({})

    const handleChangeCategory = (e) => {
        const category = options.find((item) => item.value === e.target.value);
        setData({ ...data, category: category.value });
    };

    return (
        <div className='p-5 md:w-2/4 md:flex md:flex-col md:items-center'>
            <h1 className="text-center text-4xl font-serif text-venice-blue-800 font-bold mb-4">
                Crear Evento
            </h1>
            <form className="w-full max-w-4xl md:grid md:grid-cols-2 md:gap-10 md:mt-10 md:pb-10 space-y-4 md:space-y-0">
                <FormItems
                    fields={EventStructure}
                    formItemsData={data}
                    setFormItemsData={setData}
                />
                <div className='flex flex-col'>
                    <label className="font-bold">Recursos especiales</label>
                    <textarea
                        onChange={(e) => { setData((prev) => ({ ...prev, 'especiales': e.target.value })); }}
                        className='resize-none py-1 px-2 border border-venice-blue-700 rounded-lg bg-gray-50 ' rows={5}></textarea>
                </div>

                <div className='flex flex-col'>
                    <label className="font-bold">Categoria</label>
                    <select
                        className='py-1 px-2 border border-venice-blue-700 rounded-lg bg-gray-50 '
                        required={true}
                        id='category'
                        onChange={handleChangeCategory}
                    >

                        {options &&
                            options.map((option, index) => (
                                <option key={index} value={option.value}>{option.label}</option>
                            ))}
                    </select>
                </div>
                <div className='col-span-2 flex flex-col items-center'>
                    <button
                        className="bg-venice-blue-700 text-white py-2 px-4 rounded-lg w-fit"
                        type="submit"
                    >
                        Crear Evento
                    </button>
                </div>

            </form>
        </div>
    )
}

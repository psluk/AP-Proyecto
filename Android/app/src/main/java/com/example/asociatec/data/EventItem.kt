package com.example.asociatec.data

data class EventItem(
    val uuid:String,
    val titulo:String,
    val descripcion:String,
    val capacidad:Int,
    val fechaInicio:String,
    val fechaFin:String,
    val lugar:String,
    val especiales:String,
    val categoria:String
)

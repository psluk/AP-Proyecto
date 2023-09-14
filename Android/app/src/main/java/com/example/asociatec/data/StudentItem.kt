package com.example.asociatec.data

data class StudentItem(
    val carnet: Int,
    val nombre: String,
    val apellido1: String,
    val apellido2: String,
    val carrera: CareerItem,
    val sede: LocationItem
)

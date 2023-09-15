package com.example.asociatec.data

data class RegistrationItem(
    val eventId: String,
    val eventName: String,
    val eventStart: String,
    val eventEnd: String,
    val studentNumber: Int,
    val studentName: String,
    val studentLastName1: String,
    val studentLastName2: String,
    val registrationDate: String,
    val confirmed: Boolean,
    val past: Boolean,
    val confirmable: Boolean,
    val surveyEnabled: Boolean
)

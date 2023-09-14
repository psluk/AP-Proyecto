package com.example.asociatec.user

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.JsonObject

class User private constructor(context: Context) {
    private val sharedPreferences: SharedPreferences =
        context.getSharedPreferences("UserInfo", Context.MODE_PRIVATE)
    private val gson = Gson()

    private var email = sharedPreferences.getString("email", null)
    private var studentNumber = sharedPreferences.getIntOrNull("studentNumber")
    private var userType = sharedPreferences.getString("userType", null)
    private var careerCode = sharedPreferences.getString("careerCode", null)
    private var locationCode = sharedPreferences.getString("locationCode", null)
    private var timedOut = sharedPreferences.getBoolean("timedOut", false)
    private var checkedInCurrentSession = false

    companion object {

        @Volatile
        private var instance: User? = null

        fun getInstance(context: Context) =
            instance ?: synchronized(this) {
                instance ?: User(context).also {
                    instance = it
                }
            }
    }

    fun storeUserInfo(responseString: String) {

        val editor = sharedPreferences.edit()

        val json = gson.fromJson(responseString, JsonObject::class.java)

        if (json.has("correo")) {
            email = json.get("correo").asString
            editor.putString("email", email!!)
        }

        if (json.has("carnet")) {
            val studentNumberJson = json.get("carnet")
            if (!studentNumberJson.isJsonNull) {
                studentNumber = studentNumberJson.asInt
                editor.putInt("studentNumber", studentNumber!!)
            }
        }

        if (json.has("tipoUsuario")) {
            userType = json.get("tipoUsuario").asString
            editor.putString("userType", userType!!)
        }

        if (json.has("codigoCarrera")) {
            val careerCodeJson = json.get("codigoCarrera")
            if (!careerCodeJson.isJsonNull) {
                careerCode = careerCodeJson.asString
                editor.putString("careerCode", careerCode!!)
            }
        }

        if (json.has("codigoSede")) {
            val locationCodeJson = json.get("codigoSede")
            if (!locationCodeJson.isJsonNull) {
                locationCode = locationCodeJson.asString
                editor.putString("locationCode", locationCode!!)
            }
        }

        timedOut = false
        editor.putBoolean("timedOut", false)

        editor.apply()
    }

    fun setTimedOut() {
        timedOut = true
        val editor = sharedPreferences.edit()
        editor.putBoolean("timedOut", true)
        editor.apply()
    }

    fun isLoggedIn(): Boolean {
        return !timedOut && (email != null)
    }

    fun userType(): String? {
        return this.userType
    }

    fun setCheckedInCurrentSession() {
        checkedInCurrentSession = true
    }

    fun checkedInCurrentSession(): Boolean {
        return checkedInCurrentSession
    }

    fun getEmail(): String? {
        return this.email
    }

    fun getStudentNumber(): Int? {
        return this.studentNumber
    }

    fun getCareerCode(): String?{
        return this.careerCode
    }

    fun getLocationCode(): String?{
        return this.locationCode
    }
    private fun SharedPreferences.getIntOrNull(key: String): Int? {
        // Función para retornar un Int solo si existe
        if (contains(key)) {
            return getInt(key, 0) // Retorna el valor almacenado
        }
        return null // Retorna un valor nulo
    }
}
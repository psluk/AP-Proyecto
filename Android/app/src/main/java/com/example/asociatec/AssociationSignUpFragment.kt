package com.example.asociatec

import android.app.AlertDialog
import android.app.ProgressDialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Spinner
import androidx.navigation.fragment.findNavController
import com.example.asociatec.api.ApiRequest
import com.google.gson.Gson
import com.google.gson.JsonArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class AssociationSignUpFragment : Fragment() {
    private lateinit var apiRequest: ApiRequest
    private val gson = Gson()
    private var selectedLocation: String? = null
    private var selectedCareer: String? = null
    private lateinit var currentView: View

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        apiRequest = ApiRequest.getInstance(requireContext())

        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_association_sign_up, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        currentView = view

        val locationSpinner = view.findViewById<Spinner>(R.id.location_spinner)
        val locationProgressBar = view.findViewById<ProgressBar>(R.id.locationProgressBar)
        val careerSpinner = view.findViewById<Spinner>(R.id.career_spinner)
        val careerProgressBar = view.findViewById<ProgressBar>(R.id.careerProgressBar)

        view.findViewById<Button>(R.id.buttonSignUp).setOnClickListener {
            val name = view.findViewById<EditText>(R.id.name_edit).text.toString()
            val description = view.findViewById<EditText>(R.id.description_edit).text.toString()
            val phone = view.findViewById<EditText>(R.id.phone_edit).text.toString()
            val email = view.findViewById<EditText>(R.id.email_edit).text.toString()
            val password = view.findViewById<EditText>(R.id.password_edit).text.toString()

            var fieldsOk = true
            var message = ""

            if (name.isNullOrEmpty()) {
                fieldsOk = false
                message = "El nombre no debe estar vacío"
            } else if (description.isNullOrEmpty()) {
                fieldsOk = false
                message = "La descripción no debe estar vacía"
            } else if (phone.isNullOrEmpty()) {
                fieldsOk = false
                message = "El teléfono no debe estar vacío"
            } else if (email.isNullOrEmpty()) {
                fieldsOk = false
                message = "El correo electrónico no debe estar vacío"
            } else if (!isValidEmail(email)) {
                fieldsOk = false
                message = "El correo electrónico no es una dirección válida del dominio \"@estudiantec.cr\" o \"@itcr.ac.cr\""
            } else if (password.isNullOrEmpty()) {
                fieldsOk = false
                message = "La contraseña no debe estar vacía"
            }

            if (!fieldsOk) {
                AlertDialog.Builder(requireContext())
                    .setTitle("Datos inválidos")
                    .setMessage(message)
                    .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                    .show()
            } else {

                // Se abre un popup de "Cargando"
                val progressDialog = ProgressDialog(requireContext())
                progressDialog.setMessage("Cargando...")
                progressDialog.setCancelable(false)
                progressDialog.show()

                GlobalScope.launch(Dispatchers.IO) {
                    val url = "https://asociatec.azurewebsites.net/api/asociaciones/agregar"

                    val requestBody =
                        ("{\"nombre\": \"$email\"," +
                                "\"descripcion\": \"$password\"," +
                                "\"telefono\": \"$phone\"," +
                                "\"codigoCarrera\": \"$selectedCareer\"," +
                                "\"codigoSede\": \"$selectedLocation\"," +
                                "\"correo\": \"$email\"," +
                                "\"clave\": \"$password\"}").toRequestBody(
                            "application/json".toMediaTypeOrNull()
                        )

                    val (responseStatus, responseString) = apiRequest.postRequest(url, requestBody)

                    progressDialog.dismiss()

                    if (responseStatus) {
                        requireActivity().runOnUiThread {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Éxito")
                                .setMessage("Se ha registrado exitosamente")
                                .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                .show()
                            findNavController().navigateUp()
                        }

                    } else {
                        // Ocurrió un error al hacer la consulta
                        requireActivity().runOnUiThread {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Error")
                                .setMessage(responseString)
                                .setPositiveButton("OK") { dialog, _ ->
                                    dialog.dismiss()
                                }
                                .show()
                        }
                    }
                }
            }
        }

        // Se abre un popup de "Cargando"
        val progressDialog = ProgressDialog(requireContext())
        progressDialog.setMessage("Cargando...")
        progressDialog.setCancelable(false)
        progressDialog.show()

        // Solicitud GET para la lista de sedes
        GlobalScope.launch(Dispatchers.IO) {
            val url = "https://asociatec.azurewebsites.net/api/sedes"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            // Se quita el popup de "Cargando"
            progressDialog.dismiss()

            if (responseStatus) {
                val json = gson.fromJson(responseString, JsonArray::class.java)
                val locationList = json.map { it.asJsonObject.get("nombre").asString }
                var locationCodes = json.map { it.asJsonObject.get("codigo").asString }
                requireActivity().runOnUiThread {
                    locationProgressBar.visibility = View.GONE
                    careerProgressBar.visibility = View.GONE

                    val adapter = ArrayAdapter(
                        requireContext(),
                        android.R.layout.simple_spinner_item,
                        locationList
                    )
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

                    locationSpinner.adapter = adapter
                    locationSpinner.setSelection(0)
                    locationSpinner.visibility = View.VISIBLE

                    locationSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                        override fun onItemSelected(
                            parent: AdapterView<*>,
                            view: View?,
                            position: Int,
                            id: Long
                        ) {
                            selectedLocation = locationCodes[position]
                            loadCareers(currentView)
                        }

                        override fun onNothingSelected(parent: AdapterView<*>) {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Datos inválidos")
                                .setMessage("Debe seleccionar una sede")
                                .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                .show()
                        }
                    }

                    careerSpinner.visibility = View.VISIBLE
                    careerSpinner.isEnabled = false
                    val careerList : List<String> = listOf("Debe seleccionar una sede")

                    val careerAdapter = ArrayAdapter(
                        requireContext(),
                        android.R.layout.simple_spinner_item,
                        careerList
                    )
                    careerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

                    careerSpinner.adapter = careerAdapter

                }
            } else {
                requireActivity().runOnUiThread {
                    AlertDialog.Builder(requireContext())
                        .setTitle("Error")
                        .setMessage(responseString)
                        .setPositiveButton("OK") { dialog, _ ->
                            dialog.dismiss()
                            findNavController().navigateUp()
                        }
                        .show()
                }
            }
        }
    }

    private fun isValidEmail(email: String): Boolean {
        val regex = Regex(".+@(estudiantec|itcr\\.ac|tec\\.ac)\\.cr\$")
        return regex.matches(email)
    }

    private fun loadCareers(view : View) {
        val careerSpinner = view.findViewById<Spinner>(R.id.career_spinner)
        val careerProgressBar = view.findViewById<ProgressBar>(R.id.careerProgressBar)

        careerSpinner.visibility = View.GONE
        careerProgressBar.visibility = View.VISIBLE

        // Solicitud GET para la lista de carreras
        GlobalScope.launch(Dispatchers.IO) {
            val url =
                "https://asociatec.azurewebsites.net/api/carreras?codigoSede=$selectedLocation"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            if (responseStatus) {
                val json = gson.fromJson(responseString, JsonArray::class.java)
                val careerList = json.map { it.asJsonObject.get("nombre").asString }
                var careerCodes = json.map { it.asJsonObject.get("codigo").asString }
                requireActivity().runOnUiThread {
                    careerProgressBar.visibility = View.GONE
                    careerSpinner.isEnabled = true

                    val adapter = ArrayAdapter(
                        requireContext(),
                        android.R.layout.simple_spinner_item,
                        careerList
                    )
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

                    careerSpinner.adapter = adapter
                    careerSpinner.setSelection(0)
                    careerSpinner.visibility = View.VISIBLE

                    careerSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                        override fun onItemSelected(
                            parent: AdapterView<*>,
                            view: View?,
                            position: Int,
                            id: Long
                        ) {
                            selectedCareer = careerCodes[position]
                        }

                        override fun onNothingSelected(parent: AdapterView<*>) {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Datos inválidos")
                                .setMessage("Debe seleccionar una carrera")
                                .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                .show()
                        }
                    }
                }
            } else {
                requireActivity().runOnUiThread {
                    AlertDialog.Builder(requireContext())
                        .setTitle("Error")
                        .setMessage(responseString)
                        .setPositiveButton("OK") { dialog, _ ->
                            dialog.dismiss()
                            findNavController().navigateUp()
                        }
                        .show()
                }
            }
        }
    }
}
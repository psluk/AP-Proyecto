package com.example.asociatec

import android.app.AlertDialog
import android.app.ProgressDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Spinner
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.data.StudentItem
import com.example.asociatec.user.User
import com.google.gson.Gson
import com.google.gson.JsonArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class ModifyStudentFragment : Fragment() {
    private lateinit var apiRequest: ApiRequest
    private val gson = Gson()
    private lateinit var user: User
    private var studentNumber: Int? = null
    private var selectedLocation: String? = null
    private var selectedCareer: String? = null
    private var careersAlreadyLoaded = false
    private lateinit var currentView: View

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
            studentNumber = it.getInt("studentNumber", -1)
        }

        // Si no se brindó un número de carné, se devuelve
        if (studentNumber == -1) {
            findNavController().navigateUp()
        }

        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_modify_student, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        currentView = view

        val studentNameEditText = view.findViewById<EditText>(R.id.name_edit)
        val studentLastName1EditText = view.findViewById<EditText>(R.id.lastname1_edit)
        val studentLastName2EditText = view.findViewById<EditText>(R.id.lastname2_edit)
        val studentNumberNewEditText = view.findViewById<EditText>(R.id.student_number_edit)
        val studentEmailEditText = view.findViewById<EditText>(R.id.student_email_edit)
        val studentPasswordEditText = view.findViewById<EditText>(R.id.student_password_edit)

        view.findViewById<Button>(R.id.buttonSave).setOnClickListener {
            val studentName = view.findViewById<EditText>(R.id.name_edit).text.toString()
            val studentLastName1 = view.findViewById<EditText>(R.id.lastname1_edit).text.toString()
            val studentLastName2 = view.findViewById<EditText>(R.id.lastname2_edit).text.toString()
            val studentNumberNew =
                view.findViewById<EditText>(R.id.student_number_edit).text.toString()
            val studentEmail = view.findViewById<EditText>(R.id.student_email_edit).text.toString()
            val studentPassword =
                view.findViewById<EditText>(R.id.student_password_edit).text.toString()

            var fieldsOk = true
            var message = ""

            if (studentName.isNullOrEmpty()) {
                fieldsOk = false
                message = "El nombre no debe estar vacío"
            } else if (studentLastName1.isNullOrEmpty()) {
                fieldsOk = false
                message = "El primer apellido no debe estar vacío"
            } else if (studentNumberNew.isNullOrEmpty()) {
                fieldsOk = false
                message = "El carné no debe estar vacío"
            } else if (studentEmail.isNullOrEmpty()) {
                fieldsOk = false
                message = "El correo electrónico no debe estar vacío"
            } else if (!isValidEmail(studentEmail)) {
                fieldsOk = false
                message =
                    "El correo electrónico no es una dirección válida del dominio \"@estudiantec.cr\""
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
                    val url = "https://asociatec.azurewebsites.net/api/estudiantes/modificar"

                    val requestBody =
                        ("{\"correo\": \"$studentEmail\"," +
                                "\"clave\": \"$studentPassword\"," +
                                "\"codigoCarrera\": \"$selectedCareer\"," +
                                "\"codigoSede\": \"$selectedLocation\"," +
                                "\"nombre\": \"$studentName\"," +
                                "\"apellido1\": \"$studentLastName1\"," +
                                "\"apellido2\": \"$studentLastName2\"," +
                                "\"carnet\": \"$studentNumber\"," +
                                "\"carnetNuevo\": \"$studentNumberNew\"}").toRequestBody(
                            "application/json".toMediaTypeOrNull()
                        )

                    val (responseStatus, responseString) = apiRequest.putRequest(url, requestBody)

                    progressDialog.dismiss()

                    if (responseStatus) {
                        requireActivity().runOnUiThread {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Éxito")
                                .setMessage("Estudiante modificado exitosamente")
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

        // Solicitud GET para los datos del estudiante
        GlobalScope.launch(Dispatchers.IO) {
            val url =
                "https://asociatec.azurewebsites.net/api/estudiantes/detalles?carnet=$studentNumber"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            progressDialog.dismiss()

            if (responseStatus) {
                try {
                    val json = gson.fromJson(responseString, Array<StudentItem>::class.java).toList()
                    val email = gson.fromJson(
                        responseString,
                        JsonArray::class.java
                    )[0].asJsonObject.get("correo").asString

                    requireActivity().runOnUiThread {
                        studentNameEditText.setText(json[0].nombre)
                        studentLastName1EditText.setText(json[0].apellido1)
                        studentLastName2EditText.setText(json[0].apellido2)
                        studentNumberNewEditText.setText(json[0].carnet.toString())
                        studentEmailEditText.setText(email)
                        studentPasswordEditText.setText("")

                        selectedCareer = json[0].carrera.codigo
                        selectedLocation = json[0].sede.codigo

                        loadLocations(view)
                    }
                } catch (e: Exception) {
                    // Ocurrió un error al leer la información
                    requireActivity().runOnUiThread {
                        findNavController().navigateUp()
                        AlertDialog.Builder(requireContext())
                            .setTitle("Error")
                            .setMessage("Ocurrió un error al leer los datos del estudiante")
                            .setPositiveButton("OK") { dialog, _ ->
                                dialog.dismiss()
                            }
                            .show()
                    }
                }
            } else {
                if (user.isLoggedIn()) {
                    // Ocurrió un error al hacer la consulta
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
                } else {
                    // La sesión expiró
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle(R.string.session_timeout_title)
                            .setMessage(R.string.session_timeout)
                            .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                            .show()
                        findNavController().navigate(R.id.LoginFragment)
                    }
                }
            }
        }

        // Se agrega un listener para el botón de eliminar
        view.findViewById<Button>(R.id.buttonDelete).setOnClickListener {
            // Confirmación
            AlertDialog.Builder(requireContext())
                .setTitle("Confirmación")
                .setMessage("Está a punto de eliminar el estudiante actual. ¿Desea continuar?")
                .setPositiveButton("OK") { dialog, which ->
                    // Se abre un popup de "Cargando"
                    val progressDialog = ProgressDialog(requireContext())
                    progressDialog.setMessage("Cargando...")
                    progressDialog.setCancelable(false)
                    progressDialog.show()

                    GlobalScope.launch(Dispatchers.IO) {
                        val url =
                            "https://asociatec.azurewebsites.net/api/estudiantes/eliminar?carnet=${studentNumber}"
                        val emptyRequestBody = "".toRequestBody("application/json".toMediaType())

                        val (responseStatus, responseString) = apiRequest.deleteRequest(url)

                        // Se quita el popup de "Cargando"
                        progressDialog.dismiss()

                        if (responseStatus) {
                            requireActivity().runOnUiThread {
                                AlertDialog.Builder(requireContext())
                                    .setTitle("Éxito")
                                    .setMessage("Estudiante eliminado exitosamente")
                                    .setPositiveButton("OK") { dialog, _ ->
                                        dialog.dismiss()
                                        findNavController().navigateUp()
                                    }
                                    .show()
                            }
                        } else {
                            if (user.isLoggedIn()) {
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
                            } else {
                                // La sesión expiró
                                requireActivity().runOnUiThread {
                                    AlertDialog.Builder(requireContext())
                                        .setTitle(R.string.session_timeout_title)
                                        .setMessage(R.string.session_timeout)
                                        .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                        .show()
                                    findNavController().navigate(R.id.LoginFragment)
                                }
                            }
                        }
                    }
                }
                .setNegativeButton("Cancelar") { dialog, which -> }
                .show()
        }
    }

    private fun isValidEmail(email: String): Boolean {
        val regex = Regex(".+@estudiantec\\.cr\$")
        return regex.matches(email)
    }

    private fun loadLocations(view: View) {
        val locationSpinner = view.findViewById<Spinner>(R.id.location_spinner)
        val locationProgressBar = view.findViewById<ProgressBar>(R.id.locationProgressBar)
        val careerSpinner = view.findViewById<Spinner>(R.id.career_spinner)
        val careerProgressBar = view.findViewById<ProgressBar>(R.id.careerProgressBar)

        // Solicitud GET para la lista de sedes
        GlobalScope.launch(Dispatchers.IO) {
            val url = "https://asociatec.azurewebsites.net/api/sedes"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

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

                    try {
                        locationSpinner.setSelection(locationCodes.indexOf(selectedLocation))
                    } catch (e: Exception) {
                        locationSpinner.setSelection(0)
                    }

                    locationSpinner.visibility = View.VISIBLE

                    locationSpinner.onItemSelectedListener =
                        object : AdapterView.OnItemSelectedListener {
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
                    val careerList: List<String> = listOf("Debe seleccionar una sede")

                    val careerAdapter = ArrayAdapter(
                        requireContext(),
                        android.R.layout.simple_spinner_item,
                        careerList
                    )
                    careerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

                    careerSpinner.adapter = careerAdapter

                }
            } else {
                if (user.isLoggedIn()) {
                    // Ocurrió un error al hacer la consulta
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
                } else {
                    // La sesión expiró
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle(R.string.session_timeout_title)
                            .setMessage(R.string.session_timeout)
                            .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                            .show()
                        findNavController().navigate(R.id.LoginFragment)
                    }
                }
            }
        }
    }

    private fun loadCareers(view: View) {
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

                    try {
                        if (!careersAlreadyLoaded) {
                            careerSpinner.setSelection(careerCodes.indexOf(selectedCareer))
                            careersAlreadyLoaded = true
                        } else {
                            careerSpinner.setSelection(0)
                        }
                    } catch (e: Exception) {
                        careerSpinner.setSelection(0)
                    }

                    careerSpinner.visibility = View.VISIBLE

                    careerSpinner.onItemSelectedListener =
                        object : AdapterView.OnItemSelectedListener {
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
                if (user.isLoggedIn()) {
                    // Ocurrió un error al hacer la consulta
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
                } else {
                    // La sesión expiró
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle(R.string.session_timeout_title)
                            .setMessage(R.string.session_timeout)
                            .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                            .show()
                        findNavController().navigate(R.id.LoginFragment)
                    }
                }
            }
        }
    }
}
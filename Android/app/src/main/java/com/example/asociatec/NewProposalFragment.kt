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
import com.example.asociatec.user.User
import com.google.gson.Gson
import com.google.gson.JsonArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class NewProposalFragment : Fragment() {
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    private val gson = Gson()
    private var selectedAssociationLocation: String? = null
    private var selectedAssociationCareer: String? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())

        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_new_proposal, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val progressBar = view.findViewById<ProgressBar>(R.id.association_progressBar)
        val associationSpinner = view.findViewById<Spinner>(R.id.proposal_spinner)

        view.findViewById<Button>(R.id.buttonSubmit).setOnClickListener {
            val title = view.findViewById<EditText>(R.id.title_edit).text.toString()
            val theme = view.findViewById<EditText>(R.id.theme_edit).text.toString()
            val objectives = view.findViewById<EditText>(R.id.objectives_edit).text.toString()
            val activities = view.findViewById<EditText>(R.id.activities_edit).text.toString()
            val others = view.findViewById<EditText>(R.id.others_edit).text.toString()

            var fieldsOk = true
            var message = ""

            if (title.isNullOrEmpty()) {
                fieldsOk = false
                message = "El título no debe estar vacío"
            } else if (theme.isNullOrEmpty()) {
                fieldsOk = false
                message = "La temática no debe estar vacía"
            } else if (objectives.isNullOrEmpty()) {
                fieldsOk = false
                message = "Los objetivos no deben estar vacíos"
            } else if (activities.isNullOrEmpty()) {
                fieldsOk = false
                message = "Las actividades no deben estar vacías"
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
                    val url = "https://asociatec.azurewebsites.net/api/propuestas/agregar"

                    val requestBody =
                        ("{\"carnet\": \"${user.getStudentNumber()}\"," +
                                "\"codigoCarrera\": \"$selectedAssociationCareer\"," +
                                "\"codigoSede\": \"$selectedAssociationLocation\"," +
                                "\"titulo\": \"$title\"," +
                                "\"tematica\": \"$theme\"," +
                                "\"objetivos\": \"$objectives\"," +
                                "\"actividades\": \"$activities\"," +
                                "\"otros\": \"$others\"}").toRequestBody(
                            "application/json".toMediaTypeOrNull()
                        )

                    val (responseStatus, responseString) = apiRequest.postRequest(url, requestBody)

                    progressDialog.dismiss()

                    if (responseStatus) {
                        requireActivity().runOnUiThread {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Éxito")
                                .setMessage("Propuesta registrada exitosamente")
                                .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                .show()
                            findNavController().navigateUp()
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

        // Se abre un popup de "Cargando"
        val progressDialog = ProgressDialog(requireContext())
        progressDialog.setMessage("Cargando...")
        progressDialog.setCancelable(false)
        progressDialog.show()

        // Solicitud GET para la lista de asociaciones
        GlobalScope.launch(Dispatchers.IO) {
            val url = "https://asociatec.azurewebsites.net/api/asociaciones"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            // Se quita el popup de "Cargando"
            progressDialog.dismiss()

            if (responseStatus) {
                val json = gson.fromJson(responseString, JsonArray::class.java)
                val associationNames = json.map { it.asJsonObject.get("asociacion").asJsonObject.get("nombre").asString }
                var locationCodes = json.map { it.asJsonObject.get("sede").asJsonObject.get("codigo").asString  }
                var careerCodes = json.map { it.asJsonObject.get("carrera").asJsonObject.get("codigo").asString  }

                requireActivity().runOnUiThread {
                    progressBar.visibility = View.GONE

                    val adapter = ArrayAdapter(
                        requireContext(),
                        android.R.layout.simple_spinner_item,
                        associationNames
                    )
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

                    associationSpinner.adapter = adapter
                    associationSpinner.setSelection(0)
                    associationSpinner.visibility = View.VISIBLE

                    associationSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                        override fun onItemSelected(
                            parent: AdapterView<*>,
                            view: View?,
                            position: Int,
                            id: Long
                        ) {
                            selectedAssociationLocation = locationCodes[position]
                            selectedAssociationCareer = careerCodes[position]
                        }

                        override fun onNothingSelected(parent: AdapterView<*>) {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Datos inválidos")
                                .setMessage("Debe seleccionar una asociación")
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
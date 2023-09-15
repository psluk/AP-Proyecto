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
import android.widget.Spinner
import android.widget.TextView
import androidx.fragment.app.Fragment
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

class ProposalListFragment : Fragment() {

    private lateinit var apiRequest: ApiRequest
    private val gson = Gson()
    private lateinit var user: User
    private var selectedProposal: String? = null
    private lateinit var currentView: View

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())

        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_proposal_list, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        currentView = view

        val proposalSpinner = view.findViewById<Spinner>(R.id.proposal_spinner)

        view.findViewById<Button>(R.id.buttonAccept).setOnClickListener {
            changeStatus(view, "Aceptada")
        }
        view.findViewById<Button>(R.id.buttonReject).setOnClickListener {
            changeStatus(view, "Rechazada")
        }

        // Se abre un popup de "Cargando"
        val progressDialog = ProgressDialog(requireContext())
        progressDialog.setMessage("Cargando...")
        progressDialog.setCancelable(false)
        progressDialog.show()

        // Se carga la lista de propuestas
        GlobalScope.launch(Dispatchers.IO) {
            var url =
                "https://asociatec.azurewebsites.net/api/propuestas/?estado=Sin revisar"

            if (user.userType() == "Asociación") {
                url =
                    url + "&codigoCarrera=${user.getCareerCode()}&codigoSede=${user.getLocationCode()}"
            }

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            // Se quita el popup de "Cargando"
            progressDialog.dismiss()

            if (responseStatus) {
                val json = gson.fromJson(responseString, JsonArray::class.java)
                val proposalList = json.map { it.asJsonObject.get("titulo").asString }
                var proposalIds = json.map { it.asJsonObject.get("id").asString }
                requireActivity().runOnUiThread {

                    if (proposalList.size == 0) {
                        AlertDialog.Builder(requireContext())
                            .setTitle("Sin resultados")
                            .setMessage("No hay propuestas pendientes de revisión")
                            .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                            .show()
                        findNavController().navigateUp()
                    }

                    val adapter = ArrayAdapter(
                        requireContext(),
                        android.R.layout.simple_spinner_item,
                        proposalList
                    )
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

                    proposalSpinner.adapter = adapter
                    proposalSpinner.setSelection(0)
                    proposalSpinner.visibility = View.VISIBLE

                    proposalSpinner.onItemSelectedListener =
                        object : AdapterView.OnItemSelectedListener {
                            override fun onItemSelected(
                                parent: AdapterView<*>,
                                view: View?,
                                position: Int,
                                id: Long
                            ) {
                                selectedProposal = proposalIds[position]
                                loadProposal(currentView)
                            }

                            override fun onNothingSelected(parent: AdapterView<*>) {
                                AlertDialog.Builder(requireContext())
                                    .setTitle("Datos inválidos")
                                    .setMessage("Debe seleccionar una propuesta")
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

    fun loadProposal(view: View) {
        // Se abre un popup de "Cargando"
        val progressDialog = ProgressDialog(requireContext())
        progressDialog.setMessage("Cargando...")
        progressDialog.setCancelable(false)
        progressDialog.show()

        // Se cargan los detalles de la propuesta
        GlobalScope.launch(Dispatchers.IO) {
            var url =
                "https://asociatec.azurewebsites.net/api/propuestas/detalles?propuesta=$selectedProposal"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            // Se quita el popup de "Cargando"
            progressDialog.dismiss()

            if (responseStatus) {
                val json = gson.fromJson(responseString, JsonArray::class.java)[0].asJsonObject

                requireActivity().runOnUiThread {
                    view.findViewById<TextView>(R.id.titleText).setText(json.get("titulo").asString)
                    view.findViewById<TextView>(R.id.themeText)
                        .setText(json.get("tematica").asString)
                    view.findViewById<TextView>(R.id.objectiveText)
                        .setText(json.get("objetivos").asString)
                    view.findViewById<TextView>(R.id.activityText)
                        .setText(json.get("actividades").asString)
                    view.findViewById<TextView>(R.id.otherText).setText(json.get("otros").asString)
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

    fun changeStatus(view: View, status: String) {
        // Se abre un popup de "Cargando"
        val progressDialog = ProgressDialog(requireContext())
        progressDialog.setMessage("Cargando...")
        progressDialog.setCancelable(false)
        progressDialog.show()

        // Se carga la lista de estudiantes
        GlobalScope.launch(Dispatchers.IO) {
            var url =
                "https://asociatec.azurewebsites.net/api/propuestas/modificar"

            val requestBody =
                ("{\"propuesta\": \"$selectedProposal\"," +
                        "\"estado\": \"$status\"}").toRequestBody(
                    "application/json".toMediaTypeOrNull()
                )

            val (responseStatus, responseString) = apiRequest.putRequest(url, requestBody)

            // Se quita el popup de "Cargando"
            progressDialog.dismiss()

            if (responseStatus) {
                requireActivity().runOnUiThread {
                    AlertDialog.Builder(requireContext())
                        .setTitle("Éxito")
                        .setMessage("Estado cambiado exitosamente")
                        .setPositiveButton("OK") { dialog, _ ->
                            findNavController().navigate(R.id.action_proposalListFragment_self)
                            dialog.dismiss() }
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
}
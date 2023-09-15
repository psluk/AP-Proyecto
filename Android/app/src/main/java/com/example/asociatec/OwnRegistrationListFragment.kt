package com.example.asociatec

import android.app.AlertDialog
import android.app.ProgressDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import androidx.fragment.app.Fragment
import androidx.navigation.Navigation
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.data.RegistrationItem
import com.example.asociatec.misc.LocalDate
import com.example.asociatec.user.User
import com.google.gson.Gson
import com.google.gson.JsonArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.Calendar

class OwnRegistrationListFragment : Fragment() {
    private lateinit var apiRequest: ApiRequest
    private val gson = Gson()
    private lateinit var user: User
    private lateinit var recyclerView: RecyclerView
    private val elementsPerPage = 7
    private lateinit var registrationList: MutableList<RegistrationItem>
    private lateinit var completeRegistrationList: List<RegistrationItem>
    private var currentCalendar = Calendar.getInstance()
    private lateinit var nextDay: Calendar

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        registrationList = mutableListOf()
        completeRegistrationList = listOf()

        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_own_registration_list, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        nextDay = Calendar.getInstance()
        nextDay.add(Calendar.DAY_OF_MONTH, 1)

        recyclerView = view.findViewById(R.id.studentListRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        val adapter = OwnRegistrationAdapter(registrationList, requireContext(), requireActivity())
        recyclerView.adapter = adapter

        // Se agrega un listener para agregar elementos a la lista al hacer scroll al final
        val progress = view.findViewById<ProgressBar>(R.id.progressBar)
        progress.visibility = View.VISIBLE

        // Para no cargar todos los elementos a la vez
        recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrollStateChanged(recyclerView: RecyclerView, newState: Int) {
                super.onScrollStateChanged(recyclerView, newState)
                if (newState == RecyclerView.SCROLL_STATE_IDLE) {
                    val layoutManager = recyclerView.layoutManager as LinearLayoutManager
                    val lastVisibleItemPosition = layoutManager.findLastVisibleItemPosition()
                    val totalItemCount = layoutManager.itemCount

                    if (registrationList.isNotEmpty() && lastVisibleItemPosition == totalItemCount - 1 && completeRegistrationList.size > registrationList.size) {
                        // Se cargan más elementos
                        val endIndex =
                            (totalItemCount + elementsPerPage).coerceAtMost(completeRegistrationList.size)

                        registrationList.addAll(
                            completeRegistrationList.subList(
                                totalItemCount,
                                endIndex
                            )
                        )
                        adapter.notifyItemRangeInserted(totalItemCount, endIndex)

                        if (completeRegistrationList.size <= registrationList.size) {
                            progress.visibility = View.GONE
                        }
                    }
                }
            }
        })

        // Se carga la lista de inscripciones
        GlobalScope.launch(Dispatchers.IO) {
            val url =
                "https://asociatec.azurewebsites.net/api/inscripciones/?carnet=${user.getStudentNumber()}"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            if (responseStatus) {
                val json = gson.fromJson(responseString, JsonArray::class.java).toList()
                completeRegistrationList = json.map {
                    RegistrationItem(
                        it.asJsonObject.get("evento").asJsonObject.get("id").asString,
                        it.asJsonObject.get("evento").asJsonObject.get("nombre").asString,
                        it.asJsonObject.get("evento").asJsonObject.get("inicio").asString,
                        it.asJsonObject.get("evento").asJsonObject.get("fin").asString,
                        it.asJsonObject.get("estudiante").asJsonObject.get("carnet").asInt,
                        it.asJsonObject.get("estudiante").asJsonObject.get("nombre").asString,
                        it.asJsonObject.get("estudiante").asJsonObject.get("apellido1").asString,
                        it.asJsonObject.get("estudiante").asJsonObject.get("apellido2").asString,
                        it.asJsonObject.get("inscripcion").asJsonObject.get("fecha").asString,
                        it.asJsonObject.get("inscripcion").asJsonObject.get("confirmada").asBoolean,
                        LocalDate.parseIso(it.asJsonObject.get("evento").asJsonObject.get("fin").asString).time < currentCalendar.time.time,
                        LocalDate.parseIso(it.asJsonObject.get("evento").asJsonObject.get("fin").asString).time > currentCalendar.time.time && !(it.asJsonObject.get(
                            "inscripcion"
                        ).asJsonObject.get("confirmada").asBoolean) && LocalDate.parseIso(
                            it.asJsonObject.get("evento").asJsonObject.get("inicio").asString
                        ).time <= nextDay.time.time,
                        it.asJsonObject.get("inscripcion").asJsonObject.get("encuestaActiva").asBoolean
                    )
                }

                if (completeRegistrationList.isNullOrEmpty()) {
                    val message = "No se encontraron inscripciones para su usuario"
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle("Sin resultados")
                            .setMessage(message)
                            .setPositiveButton("OK") { dialog, _ ->
                                dialog.dismiss()
                                findNavController().navigateUp()
                            }
                            .show()
                    }
                } else {
                    val endIndex = elementsPerPage.coerceAtMost(completeRegistrationList.size)
                    registrationList.addAll(completeRegistrationList.subList(0, endIndex))

                    requireActivity().runOnUiThread {
                        adapter.notifyItemRangeInserted(0, endIndex)

                        if (endIndex == completeRegistrationList.size) {
                            progress.visibility = View.GONE
                        }
                    }
                }

                requireActivity().runOnUiThread {

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

    fun eliminarInscripcion(view: View, eventId: String) {
        GlobalScope.launch(Dispatchers.IO) {
            val progressDialog = ProgressDialog(context)
            progressDialog.setMessage("Cargando...")
            progressDialog.setCancelable(false)
            progressDialog.show()

            val url = "http://localhost:3000/api/inscripciones/eliminar?evento=" +
                    "${eventId}&carnet=${user.getStudentNumber()}"
            val emptyRequestBody = "".toRequestBody("application/json".toMediaType())
            withContext(Dispatchers.IO) {
                val (responseStatus, responseString) = apiRequest.deleteRequest(url)
                progressDialog.dismiss()

                requireActivity().runOnUiThread {
                    if (responseStatus) {
                        val dialog = AlertDialog.Builder(context)
                            .setTitle("Éxito")
                            .setMessage("La inscripción fue eliminada")
                            .setPositiveButton("OK") { dialog, _ ->
                                Navigation.findNavController(view).navigate(
                                    R.id.action_own_registration_fragment_self
                                )
                            }
                            .create()
                        dialog.show()
                    } else {
                        if (user.isLoggedIn()) {
                            // Ocurrió un error al hacer la consulta
                            AlertDialog.Builder(context)
                                .setTitle("Error")
                                .setMessage(responseString)
                                .setPositiveButton("OK") { dialog, _ ->
                                    dialog.dismiss()
                                }
                                .show()
                        } else {
                            // La sesión expiró
                            AlertDialog.Builder(context)
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

}
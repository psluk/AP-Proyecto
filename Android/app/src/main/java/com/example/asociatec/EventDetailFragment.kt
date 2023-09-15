package com.example.asociatec

import android.app.AlertDialog
import android.app.ProgressDialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.R
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.data.ActivityItem
import com.example.asociatec.databinding.FragmentEventDetailBinding
import com.example.asociatec.misc.LocalDate
import com.example.asociatec.user.User
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.Calendar

class EventDetailFragment : Fragment() {

    private var _binding: FragmentEventDetailBinding? = null
    private val binding get() = _binding!!
    private var uuid: String? = null
    private var puedeIns:Boolean = true
    private var registered:Boolean = false
    private lateinit var apiRequest: ApiRequest
    private lateinit var recyclerView: RecyclerView
    private lateinit var activityList: MutableList<ActivityItem>
    private lateinit var user: User
    private val gson = Gson()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentEventDetailBinding.inflate(inflater, container, false)
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        activityList = mutableListOf()

        arguments?.let {
            uuid = it.getString("uuid")
            registered = it.getBoolean("registered", false)
        }
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.eventDetail_recycler)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        val adapter= EventDetailAdapter(activityList)
        recyclerView.adapter = adapter


        val titulo = view.findViewById<TextView>(R.id.tituloEvento)
        val descripcion = view.findViewById<TextView>(R.id.DescripcionEvento)
        val lugar = view.findViewById<TextView>(R.id.LugarEvento)
        val fechaInicio = view.findViewById<TextView>(R.id.FechaInicioEvento)
        val fechaFin = view.findViewById<TextView>(R.id.FechaFinEvento)
        val capacidad = view.findViewById<TextView>(R.id.CapacidadEvento)
        val especiales = view.findViewById<TextView>(R.id.EspecialesEvento)
        val categoria = view.findViewById<TextView>(R.id.CategoriaEvento)
        val asocia = view.findViewById<TextView>(R.id.AsociaEvento)
        val btnInscribirse = view.findViewById<Button>(R.id.btnInscribirse)
        val btnColaborador = view.findViewById<Button>(R.id.btnColaborador)
        val btnInteres = view.findViewById<Button>(R.id.btnInteres)

        if(user.userType() != "Estudiante"){
            btnInscribirse.visibility = View.GONE
        }
        val progressDialog = ProgressDialog(requireContext())
        progressDialog.setMessage("Cargando...")
        progressDialog.setCancelable(false)
        progressDialog.show()

        GlobalScope.launch(Dispatchers.IO) {
            val url = "https://asociatec.azurewebsites.net/api/eventos/detalles?uuid=$uuid"

            println(url)
            val (responseStatus, responseString) = apiRequest.getRequest(url)

            // Se quita el popup de "Cargando"
            progressDialog.dismiss()

            if (responseStatus) {
                val json = gson.fromJson(responseString, JsonArray::class.java)
                val valores = (json[0] as JsonObject)

                val tituloIN = valores.get("titulo").asString
                val descripcionIN = valores.get("descripcion").asString
                val lugarIN = valores.get("lugar").asString
                val fechaInicioIN = valores.get("fechaInicio").asString
                val fechaFinIN = valores.get("fechaFin").asString
                val capacidadIN = valores.get("capacidad").asString
                val especialesIN = valores.get("especiales").asString
                val categoriaIN = valores.get("categoria").asString
                val asociaIN = valores.get("asociacion").asString
                puedeIns = valores.get("puedeInscribirse").asBoolean

                if (registered) {
                    puedeIns = false
                }

                requireActivity().runOnUiThread {
                    titulo.text = tituloIN
                    descripcion.text = descripcionIN
                    lugar.text = lugarIN
                    fechaInicio.text = LocalDate.date(fechaInicioIN,true, true)
                    fechaFin.text = LocalDate.date(fechaFinIN,true, true)
                    capacidad.text = capacidadIN
                    especiales.text = especialesIN
                    categoria.text = categoriaIN
                    asocia.text = asociaIN

                    btnInscribirse.isEnabled = puedeIns
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

        GlobalScope.launch(Dispatchers.IO) {
            val url = "https://asociatec.azurewebsites.net/api/actividades/?uuid=$uuid"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            // Se quita el popup de "Cargando"
            progressDialog.dismiss()

            if (responseStatus) {
                activityList.addAll(gson.fromJson(responseString, Array<ActivityItem>::class.java).toList())

                requireActivity().runOnUiThread {
                    if (activityList.isNullOrEmpty()) {
                        view.findViewById<TextView>(R.id.ActividadesEvento).visibility = View.VISIBLE
                        recyclerView.visibility = View.GONE
                    } else {
                        adapter.notifyItemRangeInserted(0, activityList.size)
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

        btnInscribirse.setOnClickListener {
            GlobalScope.launch(Dispatchers.IO) {
                val url = "https://asociatec.azurewebsites.net/api/inscripciones/agregar"

                val requestBody =
                    ("{\"evento\": \"${uuid}\"," +
                            "\"carnet\":\"${user.getStudentNumber()}\"}").toRequestBody(
                        "application/json".toMediaTypeOrNull()
                    )

                val (responseStatus, responseString) = apiRequest.postRequest(url,requestBody)

                // Se quita el popup de "Cargando"
                progressDialog.dismiss()

                if (responseStatus) {
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle("Éxito")
                            .setMessage("Se ha inscrito al evento")
                            .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                            .show()
                        findNavController().navigate(R.id.action_EventDetailFragment_to_OwnRegistrationFragment)
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

        btnInteres.setOnClickListener {
            GlobalScope.launch(Dispatchers.IO) {
                val url = "https://asociatec.azurewebsites.net/api/interes/agregar"

                val requestBody =
                    ("{\"evento\": \"${uuid}\"," +
                            "\"carnet\":\"${user.getStudentNumber()}\"}").toRequestBody(
                        "application/json".toMediaTypeOrNull()
                    )

                val (responseStatus, responseString) = apiRequest.postRequest(url,requestBody)

                // Se quita el popup de "Cargando"
                progressDialog.dismiss()

                if (responseStatus) {
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle("Éxito")
                            .setMessage("Se ha marcado el evento como evento de interés")
                            .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
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

        btnColaborador.setOnClickListener {
            GlobalScope.launch(Dispatchers.IO) {
                val url = "https://asociatec.azurewebsites.net/api/colaboradores/solicitudes/agregar"

                val requestBody =
                    ("{\"uuid\": \"${uuid}\"," +
                            "\"carnet\":\"${user.getStudentNumber()}\"}").toRequestBody(
                        "application/json".toMediaTypeOrNull()
                    )

                val (responseStatus, responseString) = apiRequest.postRequest(url,requestBody)

                // Se quita el popup de "Cargando"
                progressDialog.dismiss()

                if (responseStatus) {
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle("Éxito")
                            .setMessage("Se ha enviado la solicitud")
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

}
package com.example.asociatec

import android.app.AlertDialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.navigation.fragment.findNavController
import com.example.asociatec.databinding.FragmentMenuBinding
import com.example.asociatec.R
import com.example.asociatec.user.User
import com.example.asociatec.api.ApiRequest
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class MenuFragment : Fragment() {

    private var _binding: FragmentMenuBinding? = null
    private lateinit var apiRequest : ApiRequest
    private val binding get() = _binding!!
    private val gson = Gson()
    private lateinit var user : User

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val activity = requireActivity() as AppCompatActivity
        activity.supportActionBar?.setDisplayHomeAsUpEnabled(false)

        _binding = FragmentMenuBinding.inflate(inflater, container, false)
        apiRequest = ApiRequest.getInstance(requireContext())
        user = User.getInstance(requireContext())
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val verEventosButton = view.findViewById<ConstraintLayout>(R.id.VerEventosButton)
        val eventosAsociaButton = view.findViewById<ConstraintLayout>(R.id.EventosAsociaButton)
        val verPropuestasButton = view.findViewById<ConstraintLayout>(R.id.VerPropuestasButton)
        val crearPropuestaButton = view.findViewById<ConstraintLayout>(R.id.CrearPropuestaButton)
        val verInscripcionesButton = view.findViewById<ConstraintLayout>(R.id.VerInscripcionesButton)
        val inscripcionesEstudianteButton = view.findViewById<ConstraintLayout>(R.id.InscripcionesEstudianteButton)
        val verEstudiantesButton = view.findViewById<ConstraintLayout>(R.id.VerEstudiantesButton)
        val verForoButton = view.findViewById<ConstraintLayout>(R.id.VerForoButton)

        verEventosButton.setOnTouchListener { view, event ->
            buttonPressed(view, event)
            false
        }
        eventosAsociaButton.setOnTouchListener { view, event ->
            buttonPressed(view, event)
            false
        }
        verPropuestasButton.setOnTouchListener { view, event ->
            buttonPressed(view, event)
            false
        }
        crearPropuestaButton.setOnTouchListener { view, event ->
            buttonPressed(view, event)
            false
        }
        verInscripcionesButton.setOnTouchListener { view, event ->
            buttonPressed(view, event)
            false
        }
        inscripcionesEstudianteButton.setOnTouchListener { view, event ->
            buttonPressed(view, event)
            false
        }
        verEstudiantesButton.setOnTouchListener { view, event ->
            buttonPressed(view, event)
            false
        }
        verForoButton.setOnTouchListener { view, event ->
            buttonPressed(view, event)
            false
        }

        verEventosButton.setOnClickListener {
            notImplementedWarning("Ver eventos")
        }
        eventosAsociaButton.setOnClickListener {
            notImplementedWarning("Eventos Asocia")
        }
        verPropuestasButton.setOnClickListener {
            notImplementedWarning("Ver propuestas")
        }
        crearPropuestaButton.setOnClickListener {
            notImplementedWarning("Crear propuesta")
        }
        verInscripcionesButton.setOnClickListener {
            notImplementedWarning("Ver inscripciones")
        }
        inscripcionesEstudianteButton.setOnClickListener {
            notImplementedWarning("Inscripciones Estudiante")
        }
        verEstudiantesButton.setOnClickListener {
            notImplementedWarning("Ver estudiantes")
        }
        verForoButton.setOnClickListener {
            notImplementedWarning("Ver foro")
        }

        if(user.userType() != "Estudiante"){
            inscripcionesEstudianteButton.visibility = View.GONE
            crearPropuestaButton.visibility = View.GONE
        }
        if(user.userType() != "Administrador"){
            val categoriaEstudiantes = view.findViewById<LinearLayout>(R.id.EstudiantesMenuCategoria)
            categoriaEstudiantes.visibility = View.GONE
        }
        if(user.userType() != "Asociación"){
            eventosAsociaButton.visibility = View.GONE
        }
        if(user.userType() != "Asociación" && user.userType() != "Administrador" ){
            verInscripcionesButton.visibility = View.GONE
        }

        // Si no se ha revisado el estado de la sesión desde que se abrió la aplicación,
        // se revisa aquí
        if (!user.checkedInCurrentSession()) {
            GlobalScope.launch(Dispatchers.IO) {
                val url = "https://asociatec.azurewebsites.net/api/login"

                val (responseStatus, responseString) = apiRequest.getRequest(url)
                if (responseStatus) {
                    val json = gson.fromJson(responseString, JsonObject::class.java)

                    if (json.has("loggedIn") && json.get("loggedIn").asBoolean) {
                        // El usuario continúa con la sesión activa
                        user.setCheckedInCurrentSession()
                    } else {
                        // Ya se cerró la sesión
                        user.setTimedOut()
                        requireActivity().runOnUiThread {
                            AlertDialog.Builder(requireContext())
                                .setTitle(R.string.session_timeout_title)
                                .setMessage(R.string.session_timeout)
                                .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                .show()
                            findNavController().navigate(R.id.action_MenuFragment_to_LoginFragment)
                        }
                    }

                } else {
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle("Error")
                            .setMessage(responseString)
                            .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                            .show()
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun buttonPressed(view: View, event: MotionEvent) {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                // When pressed, set the elevation to 0
                view.elevation = 0f
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                // When released or canceled, restore the default elevation
                view.elevation = resources.getDimension(R.dimen.default_elevation)
            }
        }
    }

    private fun notImplementedWarning(button: String) {
        AlertDialog.Builder(requireContext())
            .setTitle("Advertencia")
            .setMessage("${button} - Esta función aún no ha sido implementada")
            .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
            .show()
    }
}
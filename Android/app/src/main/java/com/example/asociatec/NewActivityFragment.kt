package com.example.asociatec

import android.app.AlertDialog
import android.app.DatePickerDialog
import android.app.ProgressDialog
import android.app.TimePickerDialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import com.example.asociatec.databinding.FragmentNewActivityBinding
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.databinding.FragmentNewEventBinding
import com.example.asociatec.user.User
import com.google.gson.Gson
import com.google.gson.JsonArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.*
import com.example.asociatec.misc.LocalDate

class NewActivityFragment : Fragment() {

    private var _binding: FragmentNewEventBinding? = null
    private var uuid: String? = null
    private lateinit var apiRequest: ApiRequest
    private val binding get() = _binding!!
    private val gson = Gson()
    private lateinit var user: User
    private var startCalendar = Calendar.getInstance()
    private var endCalendar = Calendar.getInstance()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        apiRequest = ApiRequest.getInstance(requireContext())
        _binding = FragmentNewEventBinding.inflate(inflater, container, false)
        user = User.getInstance(requireContext())
        arguments?.let {
            uuid = it.getString("uuid")
        }
        return inflater.inflate(R.layout.fragment_new_activity, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val startBox= view.findViewById<EditText>(R.id.fechaInicio_edit)
        val endBox= view.findViewById<EditText>(R.id.fechaFin_edit)

        startBox.setOnClickListener {
            onClickDatePicker(startBox, startCalendar)
        }

        endBox.setOnClickListener {
            onClickDatePicker(endBox, endCalendar)
        }

        val agregarButton  = view.findViewById<Button>(R.id.btnAgregarActividad)
        agregarButton.setOnClickListener {
            var fieldsOk = true
            var message = ""
            var capacity = 1
            val nameBox = view.findViewById<EditText>(R.id.nombre_edit)
            val placeBox = view.findViewById<EditText>(R.id.lugar_edit)

            if(nameBox.text.toString().isNullOrEmpty()){
                message = "Debe insertar un titulo"
                fieldsOk = false
            }
            else if(placeBox.text.toString().isNullOrEmpty()){
                message = "Debe insertar el lugar"
                fieldsOk = false
            }
            else if(startBox.text.toString().isNullOrEmpty()){
                message = "Debe insertar una fecha de inicio"
                fieldsOk = false
            }
            else if(endBox.text.toString().isNullOrEmpty()){
                message = "Debe insertar una fecha de finalización"
                fieldsOk = false
            }
            else if(startCalendar.time>=endCalendar.time){
                message = "La fecha de finalización no puede ser antes de la fecha de inicio"
                fieldsOk = false
            }
            if (!fieldsOk) {
                AlertDialog.Builder(requireContext())
                    .setTitle("Datos inválidos")
                    .setMessage(message)
                    .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                    .show()
            } else {

                val progressDialog = ProgressDialog(requireContext())
                progressDialog.setMessage("Cargando...")
                progressDialog.setCancelable(false)
                progressDialog.show()

                GlobalScope.launch(Dispatchers.IO) {
                    val url = "https://asociatec.azurewebsites.net/api/actividades/agregar"

                    val requestBody =
                        ("{\"nombre\": \"${nameBox.text}\"," +
                                "\"lugar\":\"${placeBox.text}\"," +
                                "\"fechaInicio\":\"${LocalDate.toUtc(startCalendar)}\","+
                                "\"fechaFin\":\"${LocalDate.toUtc(endCalendar)}\"," +
                                "\"uuid\":\"${uuid}\"}").toRequestBody(
                            "application/json".toMediaTypeOrNull()
                        )

                    val (responseStatus, responseString) = apiRequest.postRequest(url, requestBody)

                    progressDialog.dismiss()

                    if (responseStatus) {
                        requireActivity().runOnUiThread {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Éxito")
                                .setMessage("Actividad agregada exitosamente")
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

    // Función para el datepicker de la fecha de inicio
    private fun onClickDatePicker(editText:EditText , calendar: Calendar) {
        var year = calendar.get(Calendar.YEAR)
        var month = calendar.get(Calendar.MONTH)
        var day = calendar.get(Calendar.DAY_OF_MONTH)

        val listener = DatePickerDialog.OnDateSetListener { datePicker, y, m, d ->

            onClickTimeFilter(editText, calendar, y, m, d)
        }
        DatePickerDialog(requireContext(), listener, year, month, day).show()
    }

    private fun onClickTimeFilter(editText: EditText, calendar: Calendar, year:Int, month:Int, day:Int) {


        var hour = calendar.get(Calendar.HOUR_OF_DAY)

        var minute = calendar.get(Calendar.MINUTE)


        val listener = TimePickerDialog.OnTimeSetListener { _, h, m ->
            calendar.set(year, month, day)
            calendar.set(Calendar.HOUR_OF_DAY, h)
            calendar.set(Calendar.MINUTE, m)
            calendar.set(Calendar.SECOND, 0)
            editText.setText(LocalDate.dateTime(calendar.time))
        }

        TimePickerDialog(requireContext(), listener, hour, minute, false).show()
    }

}
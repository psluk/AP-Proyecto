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
import android.widget.Spinner
import com.example.asociatec.databinding.FragmentModifyEventBinding
import com.example.asociatec.api.ApiRequest
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
import com.google.gson.JsonObject

class ModifyEventFragment : Fragment() {

    private var _binding: FragmentModifyEventBinding? = null
    private lateinit var apiRequest: ApiRequest
    private val binding get() = _binding!!
    private val gson = Gson()
    private lateinit var user: User
    private var uuid: String? = ""
    private var selectedCategory: String? = null
    private var startCalendar = Calendar.getInstance()
    private var endCalendar = Calendar.getInstance()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        apiRequest = ApiRequest.getInstance(requireContext())
        _binding = FragmentModifyEventBinding.inflate(inflater, container, false)
        user = User.getInstance(requireContext())
        arguments?.let {
            uuid = it.getString("uuid")
        }
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val startBox= view.findViewById<EditText>(R.id.fechaInicio_edit)
        val endBox= view.findViewById<EditText>(R.id.fechaFin_edit)
        val titleBox = view.findViewById<EditText>(R.id.titulo_edit)
        val descriptionBox = view.findViewById<EditText>(R.id.descripcion_edit)
        val especialesBox = view.findViewById<EditText>(R.id.especiales_edit)
        val placeBox = view.findViewById<EditText>(R.id.lugar_edit)
        val capacityBox = view.findViewById<EditText>(R.id.capacidad_edit)
        val spinner = view.findViewById<Spinner>(R.id.categoria_spinner)


        startBox.setOnClickListener {
            onClickDatePicker(startBox, startCalendar)
        }

        endBox.setOnClickListener {
            onClickDatePicker(endBox, endCalendar)
        }

        val modificarButton  = view.findViewById<Button>(R.id.btnModificarEvento)

        modificarButton.setOnClickListener {
            var fieldsOk = true
            var message = ""
            var capacity = 1


            if(titleBox.text.toString().isNullOrEmpty()){
                message = "Debe insertar un titulo"
                fieldsOk = false
            }
            else if(descriptionBox.text.toString().isNullOrEmpty()){
                message = "Debe insertar una descripción"
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
            else{
                try{
                    capacity = capacityBox.text.toString().toInt()
                    if(capacity < 1){
                        message = "La capacidad no puede ser menor a 1"
                        fieldsOk = false
                    }
                }
                catch (e: Exception){
                    fieldsOk = false
                    message = "La capacidad debe ser un valor numérico"
                }
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
                    val url = "https://asociatec.azurewebsites.net/api/eventos/modificar"

                    val requestBody =
                        ("{\"titulo\": \"${titleBox.text}\"," +
                                "\"descripcion\":\"${descriptionBox.text}\"," +
                                "\"capacidad\":\"${capacity}\"," +
                                "\"lugar\":\"${placeBox.text}\"," +
                                "\"categoria\":\"${selectedCategory}\"," +
                                "\"especiales\":\"${especialesBox.text}\","+
                                "\"fechaInicio\":\"${LocalDate.toUtc(startCalendar)}\","+
                                "\"fechaFin\":\"${LocalDate.toUtc(endCalendar)}\"," +
                                "\"uuid\":\"${uuid}\"}").toRequestBody(
                            "application/json".toMediaTypeOrNull()
                        )

                    val (responseStatus, responseString) = apiRequest.putRequest(url, requestBody)

                    progressDialog.dismiss()

                    if (responseStatus) {
                        requireActivity().runOnUiThread {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Éxito")
                                .setMessage("Evento modificado exitosamente")
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

        // Se abre un popup de "Cargando"
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
                selectedCategory = valores.get("categoria").asString

                requireActivity().runOnUiThread {
                    titleBox.setText(tituloIN)
                    descriptionBox.setText(descripcionIN)
                    placeBox.setText(lugarIN)
                    startBox.setText(LocalDate.date(fechaInicioIN,true,true))
                    endBox.setText(LocalDate.date(fechaFinIN,true,true))
                    capacityBox.setText(capacidadIN)
                    especialesBox.setText(especialesIN)
                    startCalendar.time= LocalDate.parseIso(fechaInicioIN)
                    endCalendar.time= LocalDate.parseIso(fechaFinIN)
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
            val url = "https://asociatec.azurewebsites.net/api/eventos/categorias"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            // Se quita el popup de "Cargando"
            progressDialog.dismiss()


            if (responseStatus) {
                val json = gson.fromJson(responseString, JsonArray::class.java)
                val categoriasString = json.map { it.asJsonObject.get("categoria").asString }

                requireActivity().runOnUiThread {
                    val adapter = ArrayAdapter(
                        requireContext(),
                        android.R.layout.simple_spinner_item,
                        categoriasString
                    )
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)


                    spinner.adapter = adapter

                    try{
                        spinner.setSelection(categoriasString.indexOf(selectedCategory))
                    } catch (e:Exception){
                        spinner.setSelection(0)
                    }

                    spinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                        override fun onItemSelected(
                            parent: AdapterView<*>,
                            view: View?,
                            position: Int,
                            id: Long
                        ) {
                            selectedCategory = categoriasString[position]
                        }

                        override fun onNothingSelected(parent: AdapterView<*>) {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Datos inválidos")
                                .setMessage("Debe seleccionar una categoría")
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
                        findNavController().navigateUp()
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
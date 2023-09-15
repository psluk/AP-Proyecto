package com.example.asociatec

import android.app.AlertDialog
import android.app.ProgressDialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.navigation.findNavController
import androidx.navigation.fragment.findNavController
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.user.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import com.google.gson.Gson
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.data.Mensaje
import com.example.asociatec.databinding.FragmentDiscutionAddBinding
import com.example.asociatec.databinding.FragmentMessageAddBinding
import com.example.asociatec.databinding.FragmentMessagesBinding
import com.google.android.material.floatingactionbutton.FloatingActionButton
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class AddMessageFragment : Fragment() {

    private var _binding: FragmentMessageAddBinding? = null
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    private lateinit var local_uuid : String
    private val gson = Gson()
    private val binding get() = _binding!!
    private data class Texto (val mensaje : String)


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentMessageAddBinding.inflate(inflater, container, false)
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        arguments?.let {
            local_uuid = it.getString("uuid")!!
        }
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.buttonCrearMensaje.setOnClickListener{

            val in_contenido = view.findViewById<EditText>(R.id.editTextContenido)
            val in_correo = user.getEmail()

            val contenido = in_contenido.text.toString()
            val uuid = local_uuid
            val correo = in_correo.toString()

            if (correo.isNullOrEmpty() || correo.isBlank() || uuid.isNullOrEmpty() || uuid.isBlank()) {
                val message = "No se logra enviar el mensaje"
                requireActivity().runOnUiThread {
                    AlertDialog.Builder(requireContext())
                        .setTitle("Error")
                        .setMessage(message)
                        .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                        .show()
                }
            }

            if (contenido.isNullOrEmpty() || contenido.isBlank()){
                val message = "Mensaje Vacio"
                requireActivity().runOnUiThread {
                    AlertDialog.Builder(requireContext())
                        .setTitle("Error")
                        .setMessage(message)
                        .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                        .show()
                }
            } else {

                // Solicitud POST para crear discusion
                GlobalScope.launch(Dispatchers.IO) {
                    val url = "https://asociatec.azurewebsites.net/api/conversaciones/mensajes/agregar"
                    val requestBody =
                        "{\"correo\": \"${correo}\", \"uuid\": \"${uuid}\", \"contenido\": \"${contenido}\"}".toRequestBody("application/json".toMediaTypeOrNull())

                    val (responseStatus, responseString) = apiRequest.postRequest(url, requestBody)
                    //val message = gson.fromJson(responseString, Texto::class.java).mensaje
                }
                view.findNavController().navigateUp()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
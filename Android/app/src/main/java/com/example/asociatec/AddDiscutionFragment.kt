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
import com.example.asociatec.data.Conversacion
import com.example.asociatec.data.Mensaje
import com.example.asociatec.databinding.FragmentDiscutionAddBinding
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.gson.JsonObject
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class AddDiscutionFragment : Fragment() {

    private var _binding: FragmentDiscutionAddBinding? = null
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    private val gson = Gson()
    private val binding get() = _binding!!
    private data class Texto (val mensaje : String)


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentDiscutionAddBinding.inflate(inflater, container, false)
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        return binding.root
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.buttonCrearDiscusion.setOnClickListener{

            val in_titulo = view.findViewById<EditText>(R.id.editTextTitulo)
            val in_tag1 = view.findViewById<EditText>(R.id.editTextTag1)
            val in_tag2 = view.findViewById<EditText>(R.id.editTextTag2)
            val in_tag3 = view.findViewById<EditText>(R.id.editTextTag3)
            val in_correo = user.getEmail()

            val titulo = in_titulo.text.toString()
            val tag1 = in_tag1.text.toString()
            val tag2 = in_tag2.text.toString()
            val tag3 = in_tag3.text.toString()
            val correo = in_correo.toString()

            if (titulo.isNullOrEmpty() || titulo.isBlank()){
                val message = "Titulo vacio"
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
                    val url = "https://asociatec.azurewebsites.net/api/conversaciones/agregar"
                    val requestBody =
                        "{\"correo\": \"${correo}\", \"titulo\": \"${titulo}\", \"tags\": [\"${tag1}\",\"${tag2}\",\"${tag3}\"]}".toRequestBody("application/json".toMediaTypeOrNull())

                    val (responseStatus, responseString) = apiRequest.postRequest(url, requestBody)
                    //var mes : String
                    //
                    //if(responseStatus){
                    //    mes = "Exito"
                    //} else {
                    //    mes = "Error"
                    //}
                    //val message = gson.fromJson(responseString, Texto::class.java).mensaje
                    //requireActivity().runOnUiThread {
                    //    AlertDialog.Builder(requireContext())
                    //        .setTitle(mes)
                    //        .setMessage(message)
                    //        .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                    //        .show()
                    //}
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
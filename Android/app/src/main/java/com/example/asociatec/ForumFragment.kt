package com.example.asociatec

import android.app.AlertDialog
import android.app.ProgressDialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.appcompat.view.menu.ActionMenuItemView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.navigation.fragment.findNavController
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.databinding.FragmentForumBinding
import com.example.asociatec.user.User
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import com.google.gson.Gson
import okhttp3.Response
import com.example.asociatec.user.Conversacion
import com.google.gson.JsonArray
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
//import com.example.asociatec.user.Adaptadorconversacion

class ForumFragment : Fragment() {

    private var _binding: FragmentForumBinding? = null
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    private val gson = Gson()
    private val binding get() = _binding!!
    private lateinit var conversaciones : List<Conversacion>
    private lateinit var recyclerView: RecyclerView
    //private lateinit var adapter: AdaptadorConversacion // Create your custom adapter


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        _binding = FragmentForumBinding.inflate(inflater, container, false)

        // Se abre un popup de "Cargando"
        val progressDialog = ProgressDialog(requireContext())
        progressDialog.setMessage("Cargando...")
        progressDialog.setCancelable(false)
        progressDialog.show()

        getconveracionlist("")

            //recyclerView = findViewById(R.id.recyclerconversacion)
            //recyclerView.layoutManager = LinearLayoutManager(this)
//
            //// Initialize your custom adapter and set it to the RecyclerView
            //adapter = MyAdapter(getSampleItemList()) // Implement your custom adapter
            //recyclerView.adapter = adapter



            // Se quita el popup de "Cargando"
            progressDialog.dismiss()

        return binding.root
    }

    inner class viewholder(itemView: View) : RecyclerView.ViewHolder(itemView){

        private val item: ConstraintLayout = itemView.findViewById(R.id.recyclerconversacion)


    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)


        binding.buttonBuscar.setOnClickListener {
            val editTextitulo = view.findViewById<EditText>(R.id.editTextforo)

            // Obtener el texto ingresado
            var textoTitulo = editTextitulo.text.toString()

            // Se abre un popup de "Cargando"
            val progressDialog = ProgressDialog(requireContext())
            progressDialog.setMessage("Iniciando sesión...")
            progressDialog.setCancelable(false)
            progressDialog.show()

            // Solicitud GET conversaciones
            getconveracionlist(textoTitulo)





            // Se quita el popup de "Cargando"
            progressDialog.dismiss()
        }
    }

    private fun getconveracionlist(textoTitulo : String?){

        // Solicitud GET conversaciones
        GlobalScope.launch(Dispatchers.IO) {
            val urlBase = "https://asociatec.azurewebsites.net/api/conversaciones/"
            var param : String?

            if (textoTitulo.isNullOrEmpty()){
                param = ""
            } else {
                param = textoTitulo
            }

            var url = urlBase + "?titulo=" + param

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            if (responseStatus) {
                try {
                    conversaciones= gson.fromJson(responseString, Array<Conversacion>::class.java).toList()

                } catch (e: Exception) {
                    "Error inesperado"
                }

                //requireActivity().runOnUiThread {
                //    findNavController().navigate(R.id.action_MenuFragment_to_ForumFragment)
                //}

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


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
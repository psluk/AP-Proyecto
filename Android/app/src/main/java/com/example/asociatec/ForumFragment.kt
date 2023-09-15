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
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.databinding.FragmentForumBinding
import com.example.asociatec.user.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import com.google.gson.Gson
import com.example.asociatec.data.Conversacion
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ForumFragment : Fragment() {

    private var _binding: FragmentForumBinding? = null
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    private val gson = Gson()
    private val binding get() = _binding!!
    private lateinit var recyclerView: RecyclerView
    private lateinit var conversaciones: MutableList<Conversacion>
    private val elementsPerPage = 10

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentForumBinding.inflate(inflater, container, false)
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        conversaciones = mutableListOf()
        GlobalScope.launch(Dispatchers.IO) {

            val urlBase = "https://asociatec.azurewebsites.net/api/conversaciones/"
            val (responseStatus, responseString) = apiRequest.getRequest(urlBase)

            if (responseStatus) {
                conversaciones =
                    gson.fromJson(responseString, Array<Conversacion>::class.java).toMutableList()

            }
        }
        return binding.root
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        Thread.sleep(1000)

        recyclerView = view.findViewById(R.id.recyclerconversacion)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        val adapter= ForumAdapter(conversaciones, requireContext())
        recyclerView.adapter = adapter

        adapter.updatelista(conversaciones)
        adapter.notifyDataSetChanged()



        binding.buttonBuscar.setOnClickListener {
            val editTextitulo = view.findViewById<EditText>(R.id.editTextforo)

            // Obtener el texto ingresado
            var textoTitulo = editTextitulo.text.toString()

            GlobalScope.launch(Dispatchers.IO) {
                val urlBase = "https://asociatec.azurewebsites.net/api/conversaciones/"
                var url = urlBase + "?titulo="

                if (textoTitulo.isNullOrEmpty()){
                    url = urlBase
                } else {
                    url = url + textoTitulo
                }
                val (responseStatus, responseString) = apiRequest.getRequest(url)

                if (responseStatus) {
                    conversaciones = gson.fromJson(responseString, Array<Conversacion>::class.java).toMutableList()
                }
            }
            adapter.updatelista(conversaciones)
            adapter.notifyDataSetChanged()

            GlobalScope.launch(Dispatchers.IO) {

                if (conversaciones.isNullOrEmpty()) {
                    val message = "no hay valores"
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle("Error")
                            .setMessage(message)
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
}
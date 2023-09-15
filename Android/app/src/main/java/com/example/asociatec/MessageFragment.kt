package com.example.asociatec

import android.app.AlertDialog
import android.app.ProgressDialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.databinding.FragmentForumBinding
import com.example.asociatec.user.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import com.google.gson.Gson
import com.example.asociatec.data.Mensaje
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.databinding.FragmentMessagesBinding

class MessageFragment : Fragment() {

    private var _binding: FragmentMessagesBinding? = null
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    private val gson = Gson()
    private lateinit var uuid : String
    private lateinit var titulo : String
    private val binding get() = _binding!!
    private lateinit var recyclerView: RecyclerView
    private lateinit var mensajes: MutableList<Mensaje>
    private val elementsPerPage = 4


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        _binding = FragmentMessagesBinding.inflate(inflater, container, false)
        arguments?.let {
            uuid = it.getString("uuid")!!
            titulo = it.getString("titulo")!!
        }
        mensajes= mutableListOf()
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<TextView>(R.id.TextoTitulo).text = titulo

        // Solicitud GET conversaciones
        GlobalScope.launch(Dispatchers.IO) {
            val urlBase = "https://asociatec.azurewebsites.net/api/conversaciones/mensajes"
            var url = urlBase + "?uuid=" + uuid
            val (responseStatus, responseString) = apiRequest.getRequest(url)

            if (responseStatus) {
                mensajes= gson.fromJson(responseString, Array<Mensaje>::class.java).toMutableList()

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
        Thread.sleep(1000)
        recyclerView = view.findViewById(R.id.recyclermessage)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        val adapter= MessageAdapter(mensajes, requireContext())
        recyclerView.adapter = adapter
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
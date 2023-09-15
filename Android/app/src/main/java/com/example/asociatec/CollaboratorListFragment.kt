package com.example.asociatec

import android.app.AlertDialog
import android.app.ProgressDialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.R
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.data.ActivityItem
import com.example.asociatec.data.CollaboratorItem
import com.example.asociatec.databinding.FragmentCollaboratorListBinding
import com.example.asociatec.user.User
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class CollaboratorListFragment : Fragment() {
    private var _binding: FragmentCollaboratorListBinding? = null
    private val binding get() = _binding!!
    private var uuid: String? = null
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    private val gson = Gson()
    private lateinit var recyclerView: RecyclerView
    private lateinit var collaboratorList: MutableList<CollaboratorItem>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        _binding = FragmentCollaboratorListBinding.inflate(inflater, container, false)
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        collaboratorList = mutableListOf()
        arguments?.let {
            uuid = it.getString("uuid")
        }
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.collaboratorList_recycler)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        val adapter = CollaboratorListAdapter(collaboratorList, uuid!!, requireActivity())
        recyclerView.adapter = adapter

        // Se agrega un listener para agregar elementos a la lista al hacer scroll al final
        val progress = view.findViewById<ProgressBar>(R.id.progressBar)
        progress.visibility = View.VISIBLE

        GlobalScope.launch(Dispatchers.IO) {
            val url =
                "https://asociatec.azurewebsites.net/api/colaboradores/?uuid=$uuid&correo=${user.getEmail()}"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            // Se quita el popup de "Cargando"
            if (responseStatus) {
                collaboratorList.addAll(
                    gson.fromJson(
                        responseString,
                        Array<CollaboratorItem>::class.java
                    ).toList()
                )

                requireActivity().runOnUiThread {
                    if (collaboratorList.isNullOrEmpty()) {
                        val message = "No hay colaboradores en este evento"
                        requireActivity().runOnUiThread {
                            AlertDialog.Builder(requireContext())
                                .setTitle("Sin resultados")
                                .setMessage(message)
                                .setPositiveButton("OK") { dialog, _ ->
                                    dialog.dismiss()
                                }
                                .show()
                        }
                    } else {
                        adapter.notifyItemRangeInserted(0, collaboratorList.size)
                        progress.visibility = View.GONE
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

        val solicitudesBtn = view.findViewById<Button>(R.id.btnVerSolicitudes)
        solicitudesBtn.setOnClickListener {
            val bundle = Bundle()
            bundle.putString("uuid", uuid)

        }
    }
}
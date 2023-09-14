package com.example.asociatec

import android.app.AlertDialog
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.R
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.data.DateItem
import com.example.asociatec.databinding.FragmentCalendarBinding
import com.example.asociatec.user.User
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class  CalendarFragment : Fragment() {

    private var _binding: FragmentCalendarBinding? = null
    private val binding get() = _binding!!
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    private val gson = Gson()
    private lateinit var recyclerView: RecyclerView
    private val elementsPerPage = 7
    private lateinit var dateItemList: MutableList<DateItem>
    private lateinit var completeDateItemList: List<DateItem>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        _binding = FragmentCalendarBinding.inflate(inflater, container, false)
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        dateItemList = mutableListOf()
        completeDateItemList = listOf()
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.calendar_recycler)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        val adapter= CalendarAdapter(dateItemList, requireContext())
        recyclerView.adapter = adapter

        // Se agrega un listener para agregar elementos a la lista al hacer scroll al final
        val progress = view.findViewById<ProgressBar>(R.id.progressBar)
        progress.visibility = View.VISIBLE

        recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrollStateChanged(recyclerView: RecyclerView, newState: Int) {
                super.onScrollStateChanged(recyclerView, newState)
                if (newState == RecyclerView.SCROLL_STATE_IDLE) {
                    val layoutManager = recyclerView.layoutManager as LinearLayoutManager
                    val lastVisibleItemPosition = layoutManager.findLastVisibleItemPosition()
                    val totalItemCount = layoutManager.itemCount

                    if (dateItemList.isNotEmpty() && lastVisibleItemPosition == totalItemCount - 1 && completeDateItemList.size > dateItemList.size) {
                        // Se cargan más elementos
                        val endIndex =
                            (totalItemCount + elementsPerPage).coerceAtMost(dateItemList.size)

                        dateItemList.addAll(
                            completeDateItemList.subList(
                                totalItemCount,
                                endIndex
                            )
                        )
                        adapter.notifyItemRangeInserted(totalItemCount, endIndex)

                        if (completeDateItemList.size <= dateItemList.size) {
                            progress.visibility = View.GONE
                        }
                    }
                }
            }
        })

        GlobalScope.launch(Dispatchers.IO) {

            val url = "https://asociatec.azurewebsites.net/api/eventos/calendario"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            if (responseStatus) {
                completeDateItemList =
                    gson.fromJson(responseString, Array<DateItem>::class.java).toList()

                if (completeDateItemList.isNullOrEmpty()) {
                    val message = "No hay eventos existentes"
                    requireActivity().runOnUiThread {
                        AlertDialog.Builder(requireContext())
                            .setTitle("Sin resultados")
                            .setMessage(message)
                            .setPositiveButton("OK") { dialog, _ ->
                                dialog.dismiss()
                                findNavController().navigateUp()
                            }
                            .show()
                    }
                } else {
                    val endIndex = elementsPerPage.coerceAtMost(completeDateItemList.size)
                    dateItemList.addAll(completeDateItemList.subList(0, endIndex))

                    requireActivity().runOnUiThread {
                        adapter.notifyItemRangeInserted(0, endIndex)

                        if (endIndex == completeDateItemList.size) {
                            progress.visibility = View.GONE
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
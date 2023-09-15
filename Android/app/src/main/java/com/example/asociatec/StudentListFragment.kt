package com.example.asociatec

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.data.StudentItem
import com.example.asociatec.user.User
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class StudentListFragment : Fragment() {
    private lateinit var apiRequest: ApiRequest
    private val gson = Gson()
    private lateinit var user: User
    private lateinit var recyclerView: RecyclerView
    private val elementsPerPage = 7
    private lateinit var studentList: MutableList<StudentItem>
    private lateinit var completeStudentList: List<StudentItem>

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        user = User.getInstance(requireContext())
        apiRequest = ApiRequest.getInstance(requireContext())
        studentList = mutableListOf()
        completeStudentList = listOf()
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_student_list, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.studentListRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        val adapter = StudentAdapter(studentList)
        recyclerView.adapter = adapter

        // Se agrega un listener para agregar elementos a la lista al hacer scroll al final
        val progress = view.findViewById<ProgressBar>(R.id.progressBar)
        progress.visibility = View.VISIBLE

        // Para no cargar todos los elementos a la vez
        recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrollStateChanged(recyclerView: RecyclerView, newState: Int) {
                super.onScrollStateChanged(recyclerView, newState)
                if (newState == RecyclerView.SCROLL_STATE_IDLE) {
                    val layoutManager = recyclerView.layoutManager as LinearLayoutManager
                    val lastVisibleItemPosition = layoutManager.findLastVisibleItemPosition()
                    val totalItemCount = layoutManager.itemCount

                    if (studentList.isNotEmpty() && lastVisibleItemPosition == totalItemCount - 1 && completeStudentList.size > studentList.size) {
                        // Se cargan más elementos
                        val endIndex =
                            (totalItemCount + elementsPerPage).coerceAtMost(completeStudentList.size)

                        studentList.addAll(
                            completeStudentList.subList(
                                totalItemCount,
                                endIndex
                            )
                        )
                        adapter.notifyItemRangeInserted(totalItemCount, endIndex)

                        if (completeStudentList.size <= studentList.size) {
                            progress.visibility = View.GONE
                        }
                    }
                }
            }
        })

        // Se carga la lista de estudiantes
        GlobalScope.launch(Dispatchers.IO) {
            val url =
                "https://asociatec.azurewebsites.net/api/estudiantes/"

            val (responseStatus, responseString) = apiRequest.getRequest(url)

            if (responseStatus) {
                completeStudentList =
                    gson.fromJson(responseString, Array<StudentItem>::class.java).toList()

                if (completeStudentList.isNullOrEmpty()) {
                    val message = "No hay estudiantes existentes"
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
                    val endIndex = elementsPerPage.coerceAtMost(completeStudentList.size)
                    studentList.addAll(completeStudentList.subList(0, endIndex))

                    requireActivity().runOnUiThread {
                        adapter.notifyItemRangeInserted(0, endIndex)

                        if (endIndex == completeStudentList.size) {
                            progress.visibility = View.GONE
                        }
                    }
                }

                requireActivity().runOnUiThread {

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
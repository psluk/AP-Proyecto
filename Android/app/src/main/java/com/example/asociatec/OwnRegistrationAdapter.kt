package com.example.asociatec

import android.app.Activity
import android.app.AlertDialog
import android.app.ProgressDialog
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContentProviderCompat.requireContext
import androidx.navigation.Navigation.findNavController
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.data.RegistrationItem
import com.example.asociatec.misc.LocalDate
import com.example.asociatec.user.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

class OwnRegistrationAdapter(private val elements: List<RegistrationItem>, private val context: Context, private val activity: Activity) :
    RecyclerView.Adapter<OwnRegistrationAdapter.ViewHolder>() {

    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.own_registration_item, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val element = elements[position]
        holder.bind(element)
    }

    override fun getItemCount(): Int {
        return elements.size
    }

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val item: ConstraintLayout = itemView.findViewById(R.id.student_item)

        fun bind(element: RegistrationItem) {
            item.findViewById<TextView>(R.id.eventNameText).text = element.eventName
            item.findViewById<TextView>(R.id.eventDateText).text = LocalDate.date(element.eventStart, true)

            if (!element.past && !element.confirmed) {
                item.findViewById<Button>(R.id.buttonConfirm).visibility = View.VISIBLE
                item.findViewById<Button>(R.id.buttonConfirm).isEnabled = element.confirmable
            } else {
                item.findViewById<Button>(R.id.buttonConfirm).visibility = View.GONE
            }

            if (element.confirmed) {
                item.findViewById<Button>(R.id.buttonQrCode).visibility = View.VISIBLE
            } else {
                item.findViewById<Button>(R.id.buttonQrCode).visibility = View.GONE
            }

            if (element.past && element.confirmed) {
                if (element.surveyEnabled) {
                    item.findViewById<Button>(R.id.buttonNewSurvey).visibility = View.VISIBLE
                    item.findViewById<Button>(R.id.buttonSeeSurvey).visibility = View.GONE
                } else {
                    item.findViewById<Button>(R.id.buttonNewSurvey).visibility = View.GONE
                    item.findViewById<Button>(R.id.buttonSeeSurvey).visibility = View.VISIBLE
                }
            } else {
                item.findViewById<Button>(R.id.buttonNewSurvey).visibility = View.GONE
                item.findViewById<Button>(R.id.buttonSeeSurvey).visibility = View.GONE
            }

            if (!element.past) {
                item.findViewById<Button>(R.id.buttonDelete).visibility = View.VISIBLE
            } else {
                item.findViewById<Button>(R.id.buttonDelete).visibility = View.GONE
            }

            item.findViewById<Button>(R.id.buttonConfirm).setOnClickListener {
                confirmarInscripcion(itemView, element.eventId)
            }

            item.findViewById<Button>(R.id.buttonDelete).setOnClickListener {
                val deleteDialog = AlertDialog.Builder(context)
                    .setTitle("Confirmación")
                    .setMessage("¿Está seguro de eliminar esta inscripción?")
                    .setPositiveButton("OK") { dialog, _ ->
                        eliminarInscripcion(itemView, element.eventId)
                        dialog.dismiss()
                    }
                    .setNegativeButton("Cancelar") { dialog, _ ->
                        dialog.dismiss()
                    }
                    .create()
                deleteDialog.show()
            }

            item.findViewById<Button>(R.id.buttonNewSurvey).setOnClickListener {
                val bundle = Bundle()
                bundle.putString("eventId", element.eventId)
                bundle.putString("eventName", element.eventName)
                itemView.findNavController()
                    .navigate(R.id.action_OwnRegistrationFragment_to_RateEventFragment, bundle)
            }
        }

        private fun confirmarInscripcion(view: View, eventId: String) {
            user = User.getInstance(context)
            apiRequest = ApiRequest.getInstance(context)

            val progressDialog = ProgressDialog(context)
            progressDialog.setMessage("Cargando...")
            progressDialog.setCancelable(false)
            progressDialog.show()

            GlobalScope.launch(Dispatchers.IO) {
                val url = "https://asociatec.azurewebsites.net/api/inscripciones/confirmar"
                val emptyRequestBody = "{\"evento\":\"${eventId}\", \"carnet\":\"${user.getStudentNumber()}\"}".toRequestBody("application/json".toMediaType())
                withContext(Dispatchers.IO) {
                    val (responseStatus, responseString) = apiRequest.putRequest(url, emptyRequestBody)
                    progressDialog.dismiss()

                    activity.runOnUiThread {
                        if (responseStatus) {
                            val dialog = AlertDialog.Builder(context)
                                .setTitle("Éxito")
                                .setMessage("La inscripción fue confirmada")
                                .setPositiveButton("OK") { dialog, _ ->
                                    findNavController(view).navigate(
                                        R.id.action_own_registration_fragment_self
                                    )
                                }
                                .create()
                            dialog.show()
                        } else {
                            if (user.isLoggedIn()) {
                                // Ocurrió un error al hacer la consulta
                                AlertDialog.Builder(context)
                                    .setTitle("Error")
                                    .setMessage(responseString)
                                    .setPositiveButton("OK") { dialog, _ ->
                                        dialog.dismiss()
                                    }
                                    .show()
                            } else {
                                // La sesión expiró
                                AlertDialog.Builder(context)
                                    .setTitle(R.string.session_timeout_title)
                                    .setMessage(R.string.session_timeout)
                                    .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                    .show()
                                findNavController(view).navigate(R.id.LoginFragment)
                            }
                        }
                    }
                }
            }
        }

        private fun eliminarInscripcion(view: View, eventId: String) {
            user = User.getInstance(context)
            apiRequest = ApiRequest.getInstance(context)

            val progressDialog = ProgressDialog(context)
            progressDialog.setMessage("Cargando...")
            progressDialog.setCancelable(false)
            progressDialog.show()

            GlobalScope.launch(Dispatchers.IO) {
                                val url = "https://asociatec.azurewebsites.net/api/inscripciones/eliminar?evento=" +
                        "${eventId}&carnet=${user.getStudentNumber()}"
                val emptyRequestBody = "".toRequestBody("application/json".toMediaType())
                withContext(Dispatchers.IO) {
                    val (responseStatus, responseString) = apiRequest.deleteRequest(url)
                    progressDialog.dismiss()

                    activity.runOnUiThread {
                        if (responseStatus) {
                            val dialog = AlertDialog.Builder(context)
                                .setTitle("Éxito")
                                .setMessage("La inscripción fue eliminada")
                                .setPositiveButton("OK") { dialog, _ ->
                                    findNavController(view).navigate(
                                        R.id.action_own_registration_fragment_self
                                    )
                                }
                                .create()
                            dialog.show()
                        } else {
                            if (user.isLoggedIn()) {
                                // Ocurrió un error al hacer la consulta
                                AlertDialog.Builder(context)
                                    .setTitle("Error")
                                    .setMessage(responseString)
                                    .setPositiveButton("OK") { dialog, _ ->
                                        dialog.dismiss()
                                    }
                                    .show()
                            } else {
                                // La sesión expiró
                                AlertDialog.Builder(context)
                                    .setTitle(R.string.session_timeout_title)
                                    .setMessage(R.string.session_timeout)
                                    .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                    .show()
                                findNavController(view).navigate(R.id.LoginFragment)
                            }
                        }
                    }
                }
            }
        }
    }
}
package com.example.asociatec

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.navigation.findNavController
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.data.CollaboratorItem
import androidx.fragment.app.Fragment
import androidx.navigation.Navigation.findNavController
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.user.User
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody


class CollaboratorListAdapter(private val elements: List<CollaboratorItem>, private val uuid:String, private val activity:Activity) :
    RecyclerView.Adapter<CollaboratorListAdapter.ViewHolder>() {
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.collaborator_item, parent, false)
        user = User.getInstance(parent.context)
        apiRequest = ApiRequest.getInstance(parent.context)
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
        private val item: ConstraintLayout = itemView.findViewById(R.id.CollaboratorItem)

        fun bind(element: CollaboratorItem) {
            item.findViewById<TextView>(R.id.NameItemText).text = "${element.nombre} ${element.apellido1} ${element.apellido2}"
            item.findViewById<TextView>(R.id.CarnetItemText).text = element.carnet.toString()

            item.findViewById<Button>(R.id.deleteBtn).setOnClickListener {
                GlobalScope.launch(Dispatchers.IO) {
                    val url = "https://asociatec.azurewebsites.net/api/colaboradores/eliminar?uuid=${uuid}&carnet=${element.carnet}"

                    val (responseStatus, responseString) = apiRequest.deleteRequest(url)

                    if (responseStatus) {
                        activity.runOnUiThread {
                            AlertDialog.Builder(itemView.context)
                                .setTitle("Éxito")
                                .setMessage("Se ha eliminado el colaborador")
                                .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                .show()
                            itemView.findNavController().navigateUp()
                        }
                    } else {
                        if (user.isLoggedIn()) {
                            // Ocurrió un error al hacer la consulta
                            activity.runOnUiThread {
                                AlertDialog.Builder(itemView.context)
                                    .setTitle("Error")
                                    .setMessage(responseString)
                                    .setPositiveButton("OK") { dialog, _ ->
                                        dialog.dismiss()
                                        itemView.findNavController().navigateUp()
                                    }
                                    .show()
                            }
                        } else {
                            // La sesión expiró
                            activity.runOnUiThread {
                                AlertDialog.Builder(itemView.context)
                                    .setTitle(R.string.session_timeout_title)
                                    .setMessage(R.string.session_timeout)
                                    .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                                    .show()
                                itemView.findNavController().navigate(R.id.LoginFragment)
                            }
                        }
                    }
                }
            }
        }
    }
}
package com.example.asociatec

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.navigation.findNavController
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.R
import com.example.asociatec.data.DateItem
import com.example.asociatec.misc.LocalDate
import com.example.asociatec.data.Mensaje

class MessageAdapter(private var elements: List<Mensaje>, private val context: Context) :
    RecyclerView.Adapter<MessageAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.message_template, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        var element = elements[position]
        holder.bind(element)
    }

    override fun getItemCount(): Int {
        return elements.size
    }

    fun updatelista(newElements: List<Mensaje>) {
        elements = newElements
        notifyDataSetChanged() // Notify the adapter that the data has changed
    }

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {

        private val item: ConstraintLayout = itemView.findViewById(R.id.vermensajes)

        fun bind(element: Mensaje) {

            item.findViewById<TextView>(R.id.TextoNombreAutor).text ="Autor: " + element.autor.nombre
            item.findViewById<TextView>(R.id.TextoContenido).text = element.contenido
        }
    }
}
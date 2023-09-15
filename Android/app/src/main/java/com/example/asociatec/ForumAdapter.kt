package com.example.asociatec

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.data.Conversacion

class ForumAdapter(private var elements: MutableList<Conversacion>,private val context: Context) :
    RecyclerView.Adapter<ForumAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.discution_item, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        var element = elements[position]
        holder.bind(element)
    }

    override fun getItemCount(): Int {
        return elements.size
    }

    fun updatelista(newElements: MutableList<Conversacion>) {
        elements = newElements
        notifyDataSetChanged() // Notify the adapter that the data has changed
    }

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private var item: ConstraintLayout = itemView.findViewById(R.id.verconversacionbutton)

        fun bind(element: Conversacion) {

            item.findViewById<TextView>(R.id.textotitulo).text = element.titulo
            item.setOnClickListener {

                val bundle = Bundle()
                bundle.putString("titulo", element.titulo)
                bundle.putString("uuid", element.identificador)
                itemView.findNavController().navigate(R.id.action_ForumFragment_to_MessageFragment, bundle)

            }
        }
    }
}
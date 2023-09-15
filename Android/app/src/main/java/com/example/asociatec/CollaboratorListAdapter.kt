package com.example.asociatec

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.data.CollaboratorItem
import com.example.asociatec.misc.LocalDate


class CollaboratorListAdapter(private val elements: List<CollaboratorItem>, private val uuid:String) :
    RecyclerView.Adapter<CollaboratorListAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.collaborator_item, parent, false)
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
                println("${element.carnet}, $uuid")
            }
        }
    }
}
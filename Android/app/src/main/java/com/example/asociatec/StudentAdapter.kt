package com.example.asociatec

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.data.StudentItem

class StudentAdapter(private val elements: List<StudentItem>) :
    RecyclerView.Adapter<StudentAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.student_item, parent, false)
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
        private lateinit var concatName: String

        fun bind(element: StudentItem) {
            concatName = element.nombre + " " + element.apellido1 + " " + element.apellido2
            item.findViewById<TextView>(R.id.eventNameText).text = concatName.trim()
            item.findViewById<TextView>(R.id.eventDateText).text = element.carnet.toString()
            item.findViewById<TextView>(R.id.studentLocationText).text = element.sede.nombre
            item.findViewById<TextView>(R.id.studentCareerText).text = element.carrera.nombre

            // Se agrega el listener
            itemView.setOnClickListener {
                // Se obtiene el índice del elemento tocado

                if (adapterPosition != RecyclerView.NO_POSITION) {
                    // Si es un índice válido, entra aquí
                    val clickedItem = elements[adapterPosition]
                    val bundle = Bundle()
                    bundle.putInt("studentNumber", clickedItem.carnet)
                    itemView.findNavController()
                        .navigate(R.id.action_StudentListFragment_to_ModifyStudentFragment, bundle)
                }
            }
        }
    }
}
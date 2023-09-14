package com.example.asociatec

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.data.StudentItem
import com.example.asociatec.R

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
            item.findViewById<TextView>(R.id.studentNameText).text = concatName.trim()
            item.findViewById<TextView>(R.id.studentNumberText).text = element.carnet.toString()
            item.findViewById<TextView>(R.id.studentLocationText).text = element.sede.nombre
            item.findViewById<TextView>(R.id.studentCareerText).text = element.carrera.nombre
        }
    }
}
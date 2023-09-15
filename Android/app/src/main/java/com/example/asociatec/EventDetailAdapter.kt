package com.example.asociatec

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContentProviderCompat.requireContext
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.R
import com.example.asociatec.data.ActivityItem
import com.example.asociatec.data.DateItem
import com.example.asociatec.misc.LocalDate

class EventDetailAdapter(private val elements: List<ActivityItem>) :
    RecyclerView.Adapter<EventDetailAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.activity_item, parent, false)
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
        private val item: ConstraintLayout = itemView.findViewById(R.id.ActivityItem)

        fun bind(element: ActivityItem) {
            item.findViewById<TextView>(R.id.ActivityTitleItemText).text = element.nombre
            item.findViewById<TextView>(R.id.ActivityPlaceItemText).text = element.lugar
            item.findViewById<TextView>(R.id.ActivityStartItemText).text = LocalDate.date(element.fechaInicio,true, true)
            item.findViewById<TextView>(R.id.ActivityEndItemText).text = LocalDate.date(element.fechaFin,true, true)

        }
    }
}
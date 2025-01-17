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
import com.example.asociatec.data.DateItem
import com.example.asociatec.misc.LocalDate

class CalendarAdapter(private val elements: List<DateItem>, private val context:Context) :
    RecyclerView.Adapter<CalendarAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.date_item, parent, false)
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
        private val item: ConstraintLayout = itemView.findViewById(R.id.DateItemCard)
        private val recyclerView: RecyclerView= itemView.findViewById(R.id.events_recycler)


        fun bind(element: DateItem) {
            item.findViewById<TextView>(R.id.DateItemText).text = element.fecha
            recyclerView.layoutManager = LinearLayoutManager(context)
            val adapter= CalendarEventsAdapter(element.eventos)
            recyclerView.adapter = adapter
        }
    }
}
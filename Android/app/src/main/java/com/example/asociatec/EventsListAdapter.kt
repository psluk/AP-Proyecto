package com.example.asociatec

import com.example.asociatec.data.EventItem
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.asociatec.R
import com.example.asociatec.data.DateItem
import com.example.asociatec.misc.LocalDate

class EventsListAdapter(private val elements: List<EventItem>) :
    RecyclerView.Adapter<EventsListAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.events_item, parent, false)
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

        private val item: ConstraintLayout = itemView.findViewById(R.id.EventItem)

        fun bind(element: EventItem) {

            item.findViewById<TextView>(R.id.EventItemText).text = element.titulo
            item.findViewById<TextView>(R.id.EventPlaceItemText).text = element.lugar

            item.setOnClickListener {
                println(element.uuid)
                val bundle = Bundle()
                bundle.putString("uuid", element.uuid)
                itemView.findNavController().navigate(R.id.action_EventsListFragment_to_ModifyEventFragment,bundle)
            }
        }
    }
}
package com.example.asociatec

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.viewpager.widget.ViewPager
import com.google.android.material.tabs.TabLayout

class SignUpFragment : Fragment() {
    private lateinit var pager: ViewPager
    private lateinit var tab: TabLayout
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_signup, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        pager = view.findViewById(R.id.viewPager)
        tab = view.findViewById(R.id.tabs)

        val adapter = ViewPagerAdapter(requireFragmentManager())

        adapter.addFragment(StudentSignUpFragment(), "Estudiante")
        adapter.addFragment(AssociationSignUpFragment(), "Asociación")

        pager.adapter = adapter
        tab.setupWithViewPager(pager)
    }
}
package com.example.asociatec

import android.app.AlertDialog
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import com.example.asociatec.api.ApiRequest
import com.example.asociatec.databinding.ActivityMainBinding
import com.example.asociatec.user.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding
    private lateinit var apiRequest: ApiRequest
    private lateinit var user: User
    private val destinationChangedListener =
        NavController.OnDestinationChangedListener { _, destination, _ ->
            invalidateOptionsMenu()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        user = User.getInstance(applicationContext)
        apiRequest = ApiRequest.getInstance(applicationContext)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        val navController = findNavController(R.id.nav_host_fragment_content_main)
        appBarConfiguration = AppBarConfiguration(navController.graph)
        navController.addOnDestinationChangedListener(destinationChangedListener)
        setupActionBarWithNavController(navController, appBarConfiguration)

        // Se revisa si ya parece haber iniciado sesión
        if (user.isLoggedIn()) {
            // Parece haber iniciado sesión

            navController.navigate(R.id.MenuFragment)
        }

    }

    private fun logout() {
        // Se cierra sesión

        val navController = findNavController(R.id.nav_host_fragment_content_main)

        GlobalScope.launch(Dispatchers.IO) {
            val url = "https://asociatec.azurewebsites.net/api/logout"

            val (responseStatus, responseString) = apiRequest.getRequest(url)
            if (responseStatus) {
                user.setTimedOut()
                runOnUiThread {
                    navController.navigate(R.id.LoginFragment)
                }
            } else {
                runOnUiThread {
                    AlertDialog.Builder(this@MainActivity)
                        .setTitle("Error")
                        .setMessage(responseString)
                        .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
                        .show()
                }
            }
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        menuInflater.inflate(R.menu.menu_main, menu)

        val navHostFragment =
            supportFragmentManager.findFragmentById(R.id.nav_host_fragment_content_main)
        val currentFragment = navHostFragment?.childFragmentManager?.fragments?.get(0)

        return (currentFragment !is LoginFragment) && (currentFragment !is SignUpFragment) && (currentFragment !is StudentSignUpFragment)
    }

    override fun onPrepareOptionsMenu(menu: Menu): Boolean {
        val logoutItem = menu.findItem(R.id.action_logout)

        val navHostFragment =
            supportFragmentManager.findFragmentById(R.id.nav_host_fragment_content_main)
        val currentFragment = navHostFragment?.childFragmentManager?.fragments?.get(0)

        logoutItem?.isVisible =
            (currentFragment !is LoginFragment) && (currentFragment !is SignUpFragment) && (currentFragment !is StudentSignUpFragment)

        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        return when (item.itemId) {
            R.id.action_logout -> {
                logout()
                true
            }

            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment_content_main)
        return navController.navigateUp(appBarConfiguration)
                || super.onSupportNavigateUp()
    }

    override fun onBackPressed() {
        val navHostFragment =
            supportFragmentManager.findFragmentById(R.id.nav_host_fragment_content_main)
        val currentFragment = navHostFragment?.childFragmentManager?.fragments?.get(0)

        if (currentFragment is MenuFragment || currentFragment is LoginFragment) {
            this.finish()
        } else {
            super.onBackPressed() // Llama al super método para el comportamiento predeterminado
        }
    }
}
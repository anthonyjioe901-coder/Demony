package com.demony.invest

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.rememberNavController
import com.demony.invest.ui.navigation.DemonyNavHost
import com.demony.invest.ui.theme.DemonyTheme
import com.demony.invest.ui.viewmodels.AuthViewModel
import dagger.hilt.android.AndroidEntryPoint

/**
 * Main Activity for the Demony Android App
 * 
 * Single activity architecture using Jetpack Compose for UI
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    companion object {
        private const val PREFS_NAME = "demony_prefs"
        private const val KEY_FIRST_LAUNCH = "first_launch"
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        // Check if this is the first launch
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val isFirstLaunch = prefs.getBoolean(KEY_FIRST_LAUNCH, true)
        
        // Mark as not first launch for next time
        if (isFirstLaunch) {
            prefs.edit().putBoolean(KEY_FIRST_LAUNCH, false).apply()
        }
        
        setContent {
            val authViewModel: AuthViewModel = hiltViewModel()
            val isAuthenticated by authViewModel.isAuthenticated.collectAsState()
            val isDarkMode by authViewModel.isDarkMode.collectAsState()
            
            // Remember first launch state
            val showOnboarding = remember { mutableStateOf(isFirstLaunch && !isAuthenticated) }
            
            DemonyTheme(darkTheme = isDarkMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    
                    DemonyNavHost(
                        navController = navController,
                        isAuthenticated = isAuthenticated,
                        authViewModel = authViewModel,
                        isFirstLaunch = showOnboarding.value
                    )
                }
            }
        }
    }
}

package com.demony.invest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            val authViewModel: AuthViewModel = hiltViewModel()
            val isAuthenticated by authViewModel.isAuthenticated.collectAsState()
            val isDarkMode by authViewModel.isDarkMode.collectAsState()
            
            DemonyTheme(darkTheme = isDarkMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    
                    DemonyNavHost(
                        navController = navController,
                        isAuthenticated = isAuthenticated,
                        authViewModel = authViewModel
                    )
                }
            }
        }
    }
}

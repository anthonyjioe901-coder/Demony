package com.demony.invest

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

/**
 * Demony Investment Platform - Android Application
 * 
 * This is the main Application class for the Demony investment platform.
 * It uses Hilt for dependency injection across the entire app.
 */
@HiltAndroidApp
class DemonyApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        // Initialize any app-wide configurations here
    }
}

package com.demony.invest.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.demony.invest.ui.navigation.Screen

@Composable
fun BottomNavigationBar(navController: NavController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar {
        NavigationBarItem(
            icon = {
                Icon(
                    if (currentRoute == Screen.Home.route) Icons.Filled.Home else Icons.Outlined.Home,
                    contentDescription = "Home"
                )
            },
            label = { Text("Home") },
            selected = currentRoute == Screen.Home.route,
            onClick = {
                if (currentRoute != Screen.Home.route) {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            }
        )

        NavigationBarItem(
            icon = {
                Icon(
                    if (currentRoute == Screen.Projects.route) Icons.Filled.GridView else Icons.Outlined.GridView,
                    contentDescription = "Projects"
                )
            },
            label = { Text("Projects") },
            selected = currentRoute == Screen.Projects.route,
            onClick = {
                if (currentRoute != Screen.Projects.route) {
                    navController.navigate(Screen.Projects.route)
                }
            }
        )

        NavigationBarItem(
            icon = {
                Icon(
                    if (currentRoute == Screen.Wallet.route) Icons.Filled.AccountBalanceWallet else Icons.Outlined.AccountBalanceWallet,
                    contentDescription = "Wallet"
                )
            },
            label = { Text("Wallet") },
            selected = currentRoute == Screen.Wallet.route,
            onClick = {
                if (currentRoute != Screen.Wallet.route) {
                    navController.navigate(Screen.Wallet.route)
                }
            }
        )

        NavigationBarItem(
            icon = {
                Icon(
                    if (currentRoute == Screen.Investments.route) Icons.Filled.ShowChart else Icons.Outlined.ShowChart,
                    contentDescription = "Investments"
                )
            },
            label = { Text("Investments") },
            selected = currentRoute == Screen.Investments.route,
            onClick = {
                if (currentRoute != Screen.Investments.route) {
                    navController.navigate(Screen.Investments.route)
                }
            }
        )

        NavigationBarItem(
            icon = {
                Icon(
                    if (currentRoute == Screen.Profile.route) Icons.Filled.Person else Icons.Outlined.Person,
                    contentDescription = "Profile"
                )
            },
            label = { Text("Profile") },
            selected = currentRoute == Screen.Profile.route,
            onClick = {
                if (currentRoute != Screen.Profile.route) {
                    navController.navigate(Screen.Profile.route)
                }
            }
        )
    }
}

package com.demony.invest.ui.navigation

import androidx.compose.runtime.Composable
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.demony.invest.ui.screens.auth.LoginScreen
import com.demony.invest.ui.screens.auth.SignupScreen
import com.demony.invest.ui.screens.home.HomeScreen
import com.demony.invest.ui.screens.investments.InvestmentsScreen
import com.demony.invest.ui.screens.portfolio.PortfolioScreen
import com.demony.invest.ui.screens.profile.ProfileScreen
import com.demony.invest.ui.screens.projects.ProjectDetailScreen
import com.demony.invest.ui.screens.projects.ProjectsScreen
import com.demony.invest.ui.screens.referrals.ReferralsScreen
import com.demony.invest.ui.screens.settings.SettingsScreen
import com.demony.invest.ui.screens.support.SupportScreen
import com.demony.invest.ui.screens.wallet.WalletScreen
import com.demony.invest.ui.viewmodels.AuthViewModel

/**
 * Navigation Routes
 */
sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Signup : Screen("signup")
    object Home : Screen("home")
    object Projects : Screen("projects")
    object ProjectDetail : Screen("project/{projectId}") {
        fun createRoute(projectId: String) = "project/$projectId"
    }
    object Investments : Screen("investments")
    object Wallet : Screen("wallet")
    object Portfolio : Screen("portfolio")
    object Profile : Screen("profile")
    object Settings : Screen("settings")
    object Referrals : Screen("referrals")
    object Support : Screen("support")
}

/**
 * Main Navigation Host
 */
@Composable
fun DemonyNavHost(
    navController: NavHostController,
    isAuthenticated: Boolean,
    authViewModel: AuthViewModel
) {
    val startDestination = if (isAuthenticated) Screen.Home.route else Screen.Login.route
    
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Auth Screens
        composable(Screen.Login.route) {
            LoginScreen(
                onNavigateToSignup = { navController.navigate(Screen.Signup.route) },
                onLoginSuccess = { 
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                authViewModel = authViewModel
            )
        }
        
        composable(Screen.Signup.route) {
            SignupScreen(
                onNavigateToLogin = { navController.navigateUp() },
                onSignupSuccess = { 
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Signup.route) { inclusive = true }
                    }
                },
                authViewModel = authViewModel
            )
        }
        
        // Main App Screens
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToProjects = { navController.navigate(Screen.Projects.route) },
                onNavigateToProject = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId))
                },
                navController = navController
            )
        }
        
        composable(Screen.Projects.route) {
            ProjectsScreen(
                onNavigateToProject = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId))
                },
                navController = navController
            )
        }
        
        composable(
            route = Screen.ProjectDetail.route,
            arguments = listOf(navArgument("projectId") { type = NavType.StringType })
        ) { backStackEntry ->
            val projectId = backStackEntry.arguments?.getString("projectId") ?: return@composable
            ProjectDetailScreen(
                projectId = projectId,
                onNavigateBack = { navController.navigateUp() },
                onInvestSuccess = { navController.navigate(Screen.Investments.route) }
            )
        }
        
        composable(Screen.Investments.route) {
            InvestmentsScreen(navController = navController)
        }
        
        composable(Screen.Wallet.route) {
            WalletScreen(navController = navController)
        }
        
        composable(Screen.Portfolio.route) {
            PortfolioScreen(navController = navController)
        }
        
        composable(Screen.Profile.route) {
            ProfileScreen(navController = navController)
        }
        
        composable(Screen.Settings.route) {
            SettingsScreen(navController = navController)
        }
        
        composable(Screen.Referrals.route) {
            ReferralsScreen(navController = navController)
        }
        
        composable(Screen.Support.route) {
            SupportScreen(navController = navController)
        }
    }
}

package com.demony.invest.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NamedNavArgument
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.demony.invest.ui.screens.auth.LoginScreen
import com.demony.invest.ui.screens.auth.SignupScreen
import com.demony.invest.ui.screens.home.HomeScreen
import com.demony.invest.ui.screens.investments.InvestmentsScreen
import com.demony.invest.ui.screens.onboarding.OnboardingScreen
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
    object Onboarding : Screen("onboarding")
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
    authViewModel: AuthViewModel,
    isFirstLaunch: Boolean = false
) {
    val startDestination = when {
        isFirstLaunch && !isAuthenticated -> Screen.Onboarding.route
        isAuthenticated -> Screen.Home.route
        else -> Screen.Login.route
    }
    
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Onboarding Screen
        composable(Screen.Onboarding.route) {
            OnboardingScreen(
                onGetStarted = {
                    navController.navigate(Screen.Signup.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                },
                onSkip = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                }
            )
        }
        
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
        
        // HIGH-15: Auth-guarded main app screens
        authenticatedComposable(Screen.Home.route, isAuthenticated, navController) {
            HomeScreen(
                onNavigateToProjects = { navController.navigate(Screen.Projects.route) },
                onNavigateToProject = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId))
                },
                navController = navController
            )
        }
        
        authenticatedComposable(Screen.Projects.route, isAuthenticated, navController) {
            ProjectsScreen(
                onNavigateToProject = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId))
                },
                navController = navController
            )
        }
        
        authenticatedComposable(
            route = Screen.ProjectDetail.route,
            isAuthenticated = isAuthenticated,
            navController = navController,
            arguments = listOf(navArgument("projectId") { type = NavType.StringType })
        ) { backStackEntry ->
            val projectId = backStackEntry.arguments?.getString("projectId") ?: return@authenticatedComposable
            ProjectDetailScreen(
                projectId = projectId,
                onNavigateBack = { navController.navigateUp() },
                onInvestSuccess = { navController.navigate(Screen.Investments.route) }
            )
        }
        
        authenticatedComposable(Screen.Investments.route, isAuthenticated, navController) {
            InvestmentsScreen(navController = navController)
        }
        
        authenticatedComposable(Screen.Wallet.route, isAuthenticated, navController) {
            WalletScreen(navController = navController)
        }
        
        authenticatedComposable(Screen.Portfolio.route, isAuthenticated, navController) {
            PortfolioScreen(navController = navController)
        }
        
        authenticatedComposable(Screen.Profile.route, isAuthenticated, navController) {
            ProfileScreen(navController = navController)
        }
        
        authenticatedComposable(Screen.Settings.route, isAuthenticated, navController) {
            SettingsScreen(navController = navController)
        }
        
        authenticatedComposable(Screen.Referrals.route, isAuthenticated, navController) {
            ReferralsScreen(navController = navController)
        }
        
        authenticatedComposable(Screen.Support.route, isAuthenticated, navController) {
            SupportScreen(navController = navController)
        }
    }
}

/**
 * HIGH-15: Auth guard helper - redirects unauthenticated users to Login
 */
fun NavGraphBuilder.authenticatedComposable(
    route: String,
    isAuthenticated: Boolean,
    navController: NavHostController,
    arguments: List<NamedNavArgument> = emptyList(),
    content: @Composable (NavBackStackEntry) -> Unit
) {
    composable(route, arguments) { backStackEntry ->
        if (isAuthenticated) {
            content(backStackEntry)
        } else {
            LaunchedEffect(Unit) {
                navController.navigate(Screen.Login.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
        }
    }
}

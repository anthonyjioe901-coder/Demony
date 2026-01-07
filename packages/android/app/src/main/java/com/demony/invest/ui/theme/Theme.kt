package com.demony.invest.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = LightSurface,
    primaryContainer = Primary.copy(alpha = 0.1f),
    onPrimaryContainer = Primary,
    
    secondary = Secondary,
    onSecondary = LightSurface,
    secondaryContainer = Secondary.copy(alpha = 0.1f),
    onSecondaryContainer = Secondary,
    
    tertiary = Warning,
    onTertiary = LightSurface,
    
    error = Danger,
    onError = LightSurface,
    errorContainer = Danger.copy(alpha = 0.1f),
    onErrorContainer = Danger,
    
    background = LightBackground,
    onBackground = LightTextPrimary,
    
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightBgSecondary,
    onSurfaceVariant = LightTextMuted,
    
    outline = LightBorder,
    outlineVariant = LightBorder.copy(alpha = 0.5f)
)

private val DarkColorScheme = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = DarkBackground,
    primaryContainer = DarkPrimary.copy(alpha = 0.2f),
    onPrimaryContainer = DarkPrimary,
    
    secondary = DarkSecondary,
    onSecondary = DarkBackground,
    secondaryContainer = DarkSecondary.copy(alpha = 0.2f),
    onSecondaryContainer = DarkSecondary,
    
    tertiary = DarkWarning,
    onTertiary = DarkBackground,
    
    error = DarkDanger,
    onError = DarkBackground,
    errorContainer = DarkDanger.copy(alpha = 0.2f),
    onErrorContainer = DarkDanger,
    
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkBgSecondary,
    onSurfaceVariant = DarkTextMuted,
    
    outline = DarkBorder,
    outlineVariant = DarkBorder.copy(alpha = 0.5f)
)

@Composable
fun DemonyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

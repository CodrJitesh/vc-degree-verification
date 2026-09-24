package com.vcdegree.wallet.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

private val AppTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Bold,
        fontSize = 36.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp
    ),
    labelLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp
    )
)

private val Forest = Color(0xFF0B3D2E)
private val Leaf = Color(0xFF1F6F54)
private val Sand = Color(0xFFF2E8CF)
private val Ink = Color(0xFF14211B)
private val Coral = Color(0xFFC45C26)

private val LightColors = lightColorScheme(
    primary = Forest,
    onPrimary = Sand,
    secondary = Leaf,
    onSecondary = Sand,
    tertiary = Coral,
    background = Sand,
    onBackground = Ink,
    surface = Color(0xFFFFF8EC),
    onSurface = Ink,
    surfaceVariant = Color(0xFFE4D5B5),
    onSurfaceVariant = Ink
)

private val DarkColors = darkColorScheme(
    primary = Leaf,
    onPrimary = Sand,
    secondary = Forest,
    onSecondary = Sand,
    tertiary = Coral,
    background = Color(0xFF0E1713),
    onBackground = Sand,
    surface = Color(0xFF152019),
    onSurface = Sand
)

@Composable
fun VcWalletTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = AppTypography,
        content = content
    )
}

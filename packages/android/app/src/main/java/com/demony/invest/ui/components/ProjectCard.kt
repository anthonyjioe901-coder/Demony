package com.demony.invest.ui.components

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.demony.invest.data.models.Project

/**
 * Decodes a base64 data URL to a Bitmap
 */
@Composable
fun Base64Image(
    base64String: String,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop
) {
    val bitmap = remember(base64String) {
        try {
            // Remove the data URL prefix (e.g., "data:image/webp;base64,")
            val base64Data = if (base64String.contains(",")) {
                base64String.substringAfter(",")
            } else {
                base64String
            }
            val decodedBytes = Base64.decode(base64Data, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
        } catch (e: Exception) {
            null
        }
    }
    
    if (bitmap != null) {
        Image(
            bitmap = bitmap.asImageBitmap(),
            contentDescription = contentDescription,
            modifier = modifier,
            contentScale = contentScale
        )
    } else {
        // Fallback placeholder if decoding fails
        Box(
            modifier = modifier,
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.BrokenImage,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
            )
        }
    }
}

@Composable
fun ProjectCard(
    project: Project,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Project Image
            if (!project.imageUrl.isNullOrEmpty()) {
                val imageModifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
                    .clip(MaterialTheme.shapes.medium)
                
                // Check if it's a base64 data URL or a regular URL
                if (project.imageUrl.startsWith("data:")) {
                    Base64Image(
                        base64String = project.imageUrl,
                        contentDescription = project.name,
                        modifier = imageModifier,
                        contentScale = ContentScale.Crop
                    )
                } else {
                    AsyncImage(
                        model = project.imageUrl,
                        contentDescription = project.name,
                        modifier = imageModifier,
                        contentScale = ContentScale.Crop
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Business,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
                    )
                }
            }
            
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                // Category & Featured Badge
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AssistChip(
                        onClick = {},
                        label = { Text(project.category) },
                        leadingIcon = {
                            Icon(
                                imageVector = getCategoryIcon(project.category),
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    )
                    
                    if (project.featured) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Featured",
                            tint = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Project Name
                Text(
                    text = project.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                // Description
                Text(
                    text = project.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Funding Progress
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "${project.fundingPercentage}% funded",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "GH₵ %.0f / %.0f".format(project.raisedAmount, project.goalAmount),
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    LinearProgressIndicator(
                        progress = project.fundingProgress.coerceIn(0f, 1f),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(MaterialTheme.shapes.small),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                    )
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Project Stats
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    ProjectStat(
                        icon = Icons.Default.TrendingUp,
                        label = "Returns",
                        value = project.targetReturn
                    )
                    ProjectStat(
                        icon = Icons.Default.Schedule,
                        label = "Duration",
                        value = project.duration
                    )
                    ProjectStat(
                        icon = Icons.Default.People,
                        label = "Investors",
                        value = project.investorCount.toString()
                    )
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Min Investment & Risk
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Min: GH₵ %.0f".format(project.minInvestment),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    RiskBadge(riskLevel = project.riskLevel)
                }
            }
        }
    }
}

@Composable
private fun ProjectStat(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(16.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun RiskBadge(riskLevel: String) {
    val (color, text) = when (riskLevel.lowercase()) {
        "low" -> MaterialTheme.colorScheme.secondary to "Low Risk"
        "medium" -> MaterialTheme.colorScheme.tertiary to "Medium Risk"
        "high" -> MaterialTheme.colorScheme.error to "High Risk"
        else -> MaterialTheme.colorScheme.onSurfaceVariant to riskLevel
    }
    
    Surface(
        color = color.copy(alpha = 0.1f),
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall,
            color = color,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

private fun getCategoryIcon(category: String): androidx.compose.ui.graphics.vector.ImageVector {
    return when (category.lowercase()) {
        "agriculture" -> Icons.Default.Agriculture
        "technology" -> Icons.Default.Computer
        "real estate" -> Icons.Default.Home
        "manufacturing" -> Icons.Default.Build
        "retail" -> Icons.Default.Store
        "healthcare" -> Icons.Default.LocalHospital
        "energy" -> Icons.Default.Bolt
        "education" -> Icons.Default.School
        "transportation" -> Icons.Default.DirectionsCar
        else -> Icons.Default.Business
    }
}

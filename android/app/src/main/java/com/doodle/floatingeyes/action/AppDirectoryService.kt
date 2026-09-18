package com.doodle.floatingeyes.action

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import java.util.Locale

/**
 * Service responsible for scanning, indexing, caching, and searching
 * any installed application on the user's Android device.
 */
class AppDirectoryService(private val context: Context) {

    private val packageManager: PackageManager = context.packageManager
    private var cachedApps: List<InstalledAppInfo> = emptyList()
    private var lastScanTime: Long = 0L

    // Predefined synonyms for popular apps and native system functions
    private val standardAliases = mapOf(
        "com.google.android.youtube" to listOf("yt", "video", "videos"),
        "com.whatsapp" to listOf("wa", "chat", "message", "messaging"),
        "com.spotify.music" to listOf("music", "songs", "playlist", "tunes"),
        "com.google.android.apps.maps" to listOf("maps", "navigation", "gps", "directions"),
        "com.instagram.android" to listOf("insta", "ig", "reels"),
        "com.snapchat.android" to listOf("snap"),
        "com.twitter.android" to listOf("x", "twitter"),
        "com.google.android.gm" to listOf("mail", "email", "gmail"),
        "com.android.chrome" to listOf("browser", "internet", "web", "google"),
        "com.google.android.deskclock" to listOf("clock", "alarm", "timer", "stopwatch"),
        "com.google.android.calculator" to listOf("calc", "calculator", "math"),
        "com.google.android.apps.photos" to listOf("gallery", "photos", "pictures", "images"),
        "com.android.settings" to listOf("settings", "preferences", "config")
    )

    /**
     * Refreshes the cached list of launcher applications installed on the device.
     */
    @Synchronized
    fun getInstalledApps(forceRefresh: Boolean = false): List<InstalledAppInfo> {
        val now = System.currentTimeMillis()
        if (!forceRefresh && cachedApps.isNotEmpty() && (now - lastScanTime) < 30_000L) {
            return cachedApps
        }

        val appList = mutableListOf<InstalledAppInfo>()
        try {
            val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }

            @Suppress("DEPRECATION")
            val resolveInfos = packageManager.queryIntentActivities(mainIntent, 0)

            for (resolveInfo in resolveInfos) {
                val pkgName = resolveInfo.activityInfo?.packageName ?: continue
                // Don't include this overlay app itself
                if (pkgName == context.packageName) continue

                val label = resolveInfo.loadLabel(packageManager)?.toString() ?: pkgName
                val cleanLabel = label.trim()
                val normalized = cleanLabel.lowercase(Locale.ROOT).replace(Regex("[^a-z0-9]"), "")

                val aliases = standardAliases[pkgName] ?: emptyList()

                appList.add(
                    InstalledAppInfo(
                        appName = cleanLabel,
                        packageName = pkgName,
                        normalizedName = normalized,
                        aliases = aliases
                    )
                )
            }
        } catch (_: Exception) {
            // Fallback handled safely
        }

        cachedApps = appList
        lastScanTime = now
        return appList
    }

    /**
     * Resolves a target app query (e.g., "instagram", "insta", "calculator", "spotify")
     * into the best matching InstalledAppInfo.
     */
    fun findApp(query: String): InstalledAppInfo? {
        val cleanQuery = query.lowercase(Locale.ROOT).trim()
        val normalizedQuery = cleanQuery.replace(Regex("[^a-z0-9]"), "")
        if (normalizedQuery.isEmpty()) return null

        val apps = getInstalledApps()

        // 1. Exact match on app name
        apps.firstOrNull { it.appName.equals(cleanQuery, ignoreCase = true) }?.let { return it }

        // 2. Exact match on normalized name
        apps.firstOrNull { it.normalizedName == normalizedQuery }?.let { return it }

        // 3. Exact match on configured alias
        apps.firstOrNull { app ->
            app.aliases.any { alias -> alias.equals(cleanQuery, ignoreCase = true) || alias.equals(normalizedQuery, ignoreCase = true) }
        }?.let { return it }

        // 4. Starts with match (e.g. "insta" startsWith "instagram" or vice versa)
        apps.firstOrNull {
            it.normalizedName.startsWith(normalizedQuery) || normalizedQuery.startsWith(it.normalizedName)
        }?.let { return it }

        // 5. Contains substring match
        apps.firstOrNull { it.normalizedName.contains(normalizedQuery) }?.let { return it }

        // 6. Fuzzy alias match (e.g. "take photo" -> matches camera package)
        for (app in apps) {
            if (app.aliases.any { normalizedQuery.contains(it) || it.contains(normalizedQuery) }) {
                return app
            }
        }

        return null
    }
}

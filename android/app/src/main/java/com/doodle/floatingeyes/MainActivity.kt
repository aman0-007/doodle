package com.doodle.floatingeyes

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.doodle.floatingeyes.service.FloatingEyeService

class MainActivity : ComponentActivity() {

    private val audioPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            Toast.makeText(this, "Voice listener enabled!", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                FloatingEyesScreen(
                    onLaunchOverlay = { checkPermissionsAndStart() },
                    onStopOverlay = { stopFloatingService() },
                    onRequestVoice = { requestAudioPermission() }
                )
            }
        }
    }

    private fun checkPermissionsAndStart() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivity(intent)
            Toast.makeText(this, "Please grant Overlay Permission to float eyes", Toast.LENGTH_LONG).show()
            return
        }

        requestAudioPermission()

        val serviceIntent = Intent(this, FloatingEyeService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
        Toast.makeText(this, "Eyes are now floating!", Toast.LENGTH_SHORT).show()
    }

    private fun stopFloatingService() {
        val serviceIntent = Intent(this, FloatingEyeService::class.java)
        stopService(serviceIntent)
        Toast.makeText(this, "Floating eyes stopped", Toast.LENGTH_SHORT).show()
    }

    private fun requestAudioPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED
        ) {
            audioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }
}

@Composable
fun FloatingEyesScreen(
    onLaunchOverlay: () -> Unit,
    onStopOverlay: () -> Unit,
    onRequestVoice: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Floating Doodle Eyes",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF19EAFF)
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Float expressive eyes over any application. Eyes react to touches, track gaze, listen to speech, and launch apps.",
            fontSize = 14.sp,
            color = Color(0xFF94A3B8),
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(36.dp))

        Button(
            onClick = onLaunchOverlay,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF19EAFF)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Text("Start Floating Eyes", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedButton(
            onClick = onStopOverlay,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Text("Stop Floating", color = Color(0xFFFF4D8D))
        }

        Spacer(modifier = Modifier.height(24.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Supported Integrations:",
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text("• Voice: Say 'sleep', 'party', 'hello', 'love'", color = Color(0xFF94A3B8), fontSize = 13.sp)
                Text("• Apps: Say 'open camera', 'open spotify', 'open whatsapp'", color = Color(0xFF94A3B8), fontSize = 13.sp)
                Text("• Gestures: Tap to react, drag to move, long-press to sleep", color = Color(0xFF94A3B8), fontSize = 13.sp)
            }
        }
    }
}

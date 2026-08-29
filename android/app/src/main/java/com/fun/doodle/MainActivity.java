package com.fun.doodle;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.os.Build;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Safely make the Android Window transparent
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        
        // Request Overlay Permission from User
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
            startActivityForResult(intent, 2084);
        }
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Safely make the Capacitor WebView transparent
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);
        }
    }
}

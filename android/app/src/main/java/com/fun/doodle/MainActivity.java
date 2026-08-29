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
        
        // Make the activity window transparent
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
            startActivityForResult(intent, 2084);
        } else {
            // Start the floating service, but DO NOT call finish()
            startService(new Intent(this, OverlayService.class));
            
            // Move the main app to the background seamlessly
            moveTaskToBack(true); 
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 2084 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (Settings.canDrawOverlays(this)) {
                startService(new Intent(this, OverlayService.class));
                moveTaskToBack(true);
            }
        }
    }
}

package com.fun.doodle;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.os.Build;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            // Ask for permission if we don't have it
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
            startActivityForResult(intent, 2084);
        } else {
            // We have permission! Start the floating service and close the main app.
            startService(new Intent(this, OverlayService.class));
            finish();
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 2084 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (Settings.canDrawOverlays(this)) {
                startService(new Intent(this, OverlayService.class));
                finish();
            }
        }
    }
}

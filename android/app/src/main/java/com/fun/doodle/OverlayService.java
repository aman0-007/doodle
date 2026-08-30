package com.fun.doodle;

import android.animation.ValueAnimator;
import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class OverlayService extends Service {
    private WindowManager windowManager;
    private WebView webView;
    private WindowManager.LayoutParams params;
    private int screenWidth;
    
    // DP variables for perfect scaling on ANY phone screen
    private final float DOODLE_DP = 140f; 
    private final float WEB_BOX_DP = DOODLE_DP + 36f;

    @Override
    public void onCreate() {
        super.onCreate();
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        // Get exact screen width and density multiplier
        DisplayMetrics metrics = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(metrics);
        screenWidth = metrics.widthPixels;
        float density = metrics.density;

        // Convert DP to physical pixels for Android's WindowManager
        // This makes the invisible box huge so animations never get cut off!
        int boxSizePx = (int) (WEB_BOX_DP * density);
        int paddingPx = (int) (((WEB_BOX_DP - DOODLE_DP) / 2) * density);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webView.loadUrl("file:///android_asset/public/index.html");

        params = new WindowManager.LayoutParams(
                boxSizePx, boxSizePx,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                        : WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                PixelFormat.TRANSLUCENT);

        params.gravity = Gravity.TOP | Gravity.LEFT;
        params.x = 0;
        params.y = 300;

        webView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX;
            private int initialY;
            private float initialTouchX;
            private float initialTouchY;
            private boolean isDragging = false;
            private boolean isRubbing = false;
            private long touchDownTime = 0;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        isDragging = false;
                        isRubbing = false;
                        touchDownTime = System.currentTimeMillis();
                        return false; 

                    case MotionEvent.ACTION_MOVE:
                        int deltaX = (int) (event.getRawX() - initialTouchX);
                        int deltaY = (int) (event.getRawY() - initialTouchY);
                        
                        if (System.currentTimeMillis() - touchDownTime < 250) {
                            if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
                                isRubbing = true; 
                            }
                        }

                        if (!isRubbing && (System.currentTimeMillis() - touchDownTime >= 250)) {
                            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                                isDragging = true;
                            }
                        }

                        if (isDragging) {
                            params.x = initialX + deltaX;
                            params.y = initialY + deltaY;
                            windowManager.updateViewLayout(webView, params);
                            return true; 
                        }
                        return false;

                    case MotionEvent.ACTION_UP:
                    case MotionEvent.ACTION_CANCEL:
                        if (isDragging) {
                            // ZERO-HIDING EDGE SNAP MATH
                            // We offset exactly by the empty padding, making the doodle sit 100% flush.
                            int leftSnap = -paddingPx; 
                            int rightSnap = screenWidth - boxSizePx + paddingPx;

                            int middle = screenWidth / 2;
                            int currentCenter = params.x + (boxSizePx / 2);
                            
                            int targetX = (currentCenter < middle) ? leftSnap : rightSnap;

                            ValueAnimator animator = ValueAnimator.ofInt(params.x, targetX);
                            animator.setDuration(250); 
                            animator.addUpdateListener(animation -> {
                                params.x = (Integer) animation.getAnimatedValue();
                                windowManager.updateViewLayout(webView, params);
                            });
                            animator.start();
                            return true; 
                        }
                        return false;
                }
                return false;
            }
        });

        windowManager.addView(webView, params);
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (webView != null) windowManager.removeView(webView);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

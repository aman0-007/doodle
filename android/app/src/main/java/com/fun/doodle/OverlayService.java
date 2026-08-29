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
    private final int BOX_SIZE = 450;

    @Override
    public void onCreate() {
        super.onCreate();
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        // Get exact screen width for perfect edge snapping
        DisplayMetrics metrics = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(metrics);
        screenWidth = metrics.widthPixels;

        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webView.loadUrl("file:///android_asset/public/index.html");

        params = new WindowManager.LayoutParams(
                BOX_SIZE, BOX_SIZE,
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
                        isRubbing = false; // Reset interaction state
                        touchDownTime = System.currentTimeMillis();
                        return false; // Let the webview see the down event

                    case MotionEvent.ACTION_MOVE:
                        int deltaX = (int) (event.getRawX() - initialTouchX);
                        int deltaY = (int) (event.getRawY() - initialTouchY);
                        
                        // 1. Detect if user started rubbing immediately (within 250ms)
                        if (System.currentTimeMillis() - touchDownTime < 250) {
                            if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
                                isRubbing = true; // Lock into rubbing mode! Dragging disabled.
                            }
                        }

                        // 2. If it's NOT a rub, and they held for > 250ms, unlock dragging
                        if (!isRubbing && (System.currentTimeMillis() - touchDownTime >= 250)) {
                            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                                isDragging = true;
                            }
                        }

                        // 3. Move the window if dragging is unlocked
                        if (isDragging) {
                            params.x = initialX + deltaX;
                            params.y = initialY + deltaY;
                            windowManager.updateViewLayout(webView, params);
                            return true; // Consume event so JS doesn't count it as a pet/rub
                        }
                        return false;

                    case MotionEvent.ACTION_UP:
                    case MotionEvent.ACTION_CANCEL:
                        if (isDragging) {
                            // PERFECT EDGE SNAPPING MATH
                            // Box = 450px. Doodle = 140px. Empty space = 155px.
                            // To hide exactly 40px of doodle on the edge:
                            int leftSnap = -195; 
                            int rightSnap = screenWidth - (BOX_SIZE + leftSnap);

                            int middle = screenWidth / 2;
                            int currentCenter = params.x + (BOX_SIZE / 2);
                            
                            int targetX = (currentCenter < middle) ? leftSnap : rightSnap;

                            ValueAnimator animator = ValueAnimator.ofInt(params.x, targetX);
                            animator.setDuration(300); // 300ms smooth glide
                            animator.addUpdateListener(animation -> {
                                params.x = (Integer) animation.getAnimatedValue();
                                windowManager.updateViewLayout(webView, params);
                            });
                            animator.start();
                            return true; // Consume UP event so it doesn't trigger a JS click
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

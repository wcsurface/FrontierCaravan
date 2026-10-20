# Keep AndroidNativeBridge and JavascriptInterface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keepclassmembers class app.vercel.frontiercaravan.AndroidNativeBridge {
    *;
}

# Keep WebKit and WebSettings
-keep class androidx.webkit.** { *; }

# Keep Gson
-keep class com.google.gson.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

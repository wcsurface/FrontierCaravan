# Keep MainActivity and all inner classes
-keep class app.vercel.livelore.MainActivity { *; }
-keep class app.vercel.livelore.MainActivity$* { *; }

# Keep all classes in app.vercel.livelore package
-keep class app.vercel.livelore.** { *; }

# Keep all @JavascriptInterface annotated methods and their containing classes
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

-keepclasseswithmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebKit and WebSettings
-keep class androidx.webkit.** { *; }
-keep class android.webkit.** { *; }

# Keep Google Mobile Ads / AdMob SDK
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.internal.ads.** { *; }

# Keep Google Play Billing Library
-keep class com.android.billingclient.** { *; }

# Keep Gson
-keep class com.google.code.gson.** { *; }
-keep class com.google.gson.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep FileProvider
-keep class androidx.core.content.FileProvider { *; }

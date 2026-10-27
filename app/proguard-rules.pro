# Keep MainActivity and all inner classes
-keep class app.vercel.livelore.MainActivity { *; }
-keep class app.vercel.livelore.MainActivity$* { *; }
-keep class app.vercel.livelore.** { *; }

# Keep all @JavascriptInterface annotated methods and their containing classes
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod,Exceptions

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
-keep class com.google.android.gms.common.** { *; }

# Keep Google Play Billing Library
-keep class com.android.billingclient.** { *; }

# Keep Gson
-keep class com.google.code.gson.** { *; }
-keep class com.google.gson.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep FileProvider and AndroidX Core
-keep class androidx.core.content.FileProvider { *; }
-keep class androidx.core.** { *; }

# Don't warn on missing optional third-party references
-dontwarn com.google.android.gms.**
-dontwarn com.android.billingclient.**
-dontwarn androidx.webkit.**

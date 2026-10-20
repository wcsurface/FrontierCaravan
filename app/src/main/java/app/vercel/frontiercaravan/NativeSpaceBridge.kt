package app.vercel.frontiercaravan

import android.content.Context
import android.content.Context.VIBRATOR_SERVICE
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
import android.content.pm.ActivityInfo
import android.media.AudioManager
import android.media.ToneGenerator
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.Settings
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import java.util.UUID

class NativeSpaceBridge(
    private val activity: MainActivity,
    private val webView: WebView
) {
    private val prefs: SharedPreferences =
        activity.getSharedPreferences("TelosSpacePrefs", Context.MODE_PRIVATE)

    @JavascriptInterface
    fun vibrate(milliseconds: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager =
                    activity.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                val vibrator = vibratorManager.defaultVibrator
                vibrator.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = activity.getSystemService(VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(milliseconds)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun keepScreenOn(enabled: Boolean) {
        activity.runOnUiThread {
            if (enabled) {
                activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            } else {
                activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            }
        }
    }

    @JavascriptInterface
    fun getBatteryLevel(): Int {
        return try {
            val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { filter ->
                activity.registerReceiver(null, filter)
            }
            val level: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
            if (level >= 0 && scale > 0) {
                ((level / scale.toFloat()) * 100).toInt()
            } else {
                100
            }
        } catch (e: Exception) {
            100
        }
    }

    @JavascriptInterface
    fun getDeviceId(): String {
        var deviceId = prefs.getString("device_id", null)
        if (deviceId.isNullOrEmpty()) {
            try {
                deviceId = Settings.Secure.getString(
                    activity.contentResolver,
                    Settings.Secure.ANDROID_ID
                )
            } catch (e: Exception) {
                deviceId = null
            }
            if (deviceId.isNullOrEmpty() || deviceId == "9774d56d682e549c") {
                deviceId = UUID.randomUUID().toString()
            }
            prefs.edit().putString("device_id", deviceId).apply()
        }
        return deviceId
    }

    @JavascriptInterface
    fun setOrientation(orientation: String) {
        activity.runOnUiThread {
            when (orientation.lowercase()) {
                "landscape" -> activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                "sensor_landscape" -> activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
                "portrait" -> activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                else -> activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
            }
        }
    }

    @JavascriptInterface
    fun playAudioCue(soundName: String) {
        try {
            val toneType = when (soundName.lowercase()) {
                "click", "tap" -> ToneGenerator.TONE_PROP_BEEP
                "combat", "shoot" -> ToneGenerator.TONE_CDMA_KEYPAD_VOLUME_KEY_LITE
                "explosion", "warp" -> ToneGenerator.TONE_SUP_ERROR
                "trade", "buy" -> ToneGenerator.TONE_PROP_ACK
                "warning", "warden" -> ToneGenerator.TONE_PROP_PROMPT
                else -> ToneGenerator.TONE_PROP_BEEP
            }
            val toneGen = ToneGenerator(AudioManager.STREAM_MUSIC, 85)
            toneGen.startTone(toneType, 180)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun saveLocalState(jsonState: String) {
        prefs.edit().putString("telos_save_state", jsonState).apply()
    }

    @JavascriptInterface
    fun loadLocalState(): String {
        return prefs.getString("telos_save_state", "") ?: ""
    }

    @JavascriptInterface
    fun isNetworkAvailable(): Boolean {
        val cm = activity.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    @JavascriptInterface
    fun notifyOnlineStatusChanged(isOnline: Boolean) {
        activity.runOnUiThread {
            webView.evaluateJavascript("if (window.onNativeNetworkStatusChange) { window.onNativeNetworkStatusChange($isOnline); }", null)
        }
    }
}

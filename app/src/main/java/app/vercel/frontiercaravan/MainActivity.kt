package app.vercel.frontiercaravan

import android.accounts.AccountManager
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.activity.ComponentActivity
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.MobileAds

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var adView: AdView
    private lateinit var adContainerLayout: LinearLayout
    private val REQUEST_CODE_PICK_ACCOUNT = 1002

    // Official Google AdMob Test Banner Unit ID
    private val ADMOB_BANNER_TEST_UNIT_ID = "ca-app-pub-3940256099942544/6300978111"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        hideSystemUI()

        // 1. Initialize Google Mobile Ads SDK
        MobileAds.initialize(this) {}

        // 2. Main Root Layout (Vertical Linear Layout)
        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0A0D0E"))
        }

        // 3. Main WebView
        webView = WebView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1.0f
            )
        }

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
            }
        }

        // 4. AdMob Banner Container Anchored securely at Bottom
        adContainerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#0A0D0E"))
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            visibility = View.VISIBLE
        }

        adView = AdView(this).apply {
            setAdSize(AdSize.BANNER)
            adUnitId = ADMOB_BANNER_TEST_UNIT_ID
        }

        adContainerLayout.addView(adView)

        // Load Official AdMob Test Banner Ad
        val adRequest = AdRequest.Builder().build()
        adView.loadAd(adRequest)

        // Assemble Layout
        rootLayout.addView(webView)
        rootLayout.addView(adContainerLayout)
        setContentView(rootLayout)

        // Expose Native Interfaces to JavaScript
        webView.addJavascriptInterface(AndroidHapticsInterface(this), "AndroidHaptics")
        webView.addJavascriptInterface(AndroidGoogleAuthInterface(this), "AndroidGoogleAuth")
        webView.addJavascriptInterface(AndroidAdMobInterface(), "AndroidAdMob")

        val targetUrl = "file:///android_asset/index.html"
        webView.loadUrl(targetUrl)
    }

    private fun hideSystemUI() {
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_FULLSCREEN
        )
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_CODE_PICK_ACCOUNT && resultCode == RESULT_OK && data != null) {
            val accountName = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME)
            if (!accountName.isNullOrEmpty()) {
                val safeEmail = accountName.lowercase().trim()
                webView.post {
                    webView.evaluateJavascript("onNativeGoogleAuthSuccess('$safeEmail')", null)
                }
            }
        }
    }

    // Native AdMob Interface to show/hide banner on specific screens
    inner class AndroidAdMobInterface {
        @JavascriptInterface
        fun showBannerAd() {
            runOnUiThread {
                adContainerLayout.visibility = View.VISIBLE
            }
        }

        @JavascriptInterface
        fun hideBannerAd() {
            runOnUiThread {
                adContainerLayout.visibility = View.GONE
            }
        }
    }

    inner class AndroidGoogleAuthInterface(private val context: Context) {
        @JavascriptInterface
        fun launchGoogleSignIn() {
            runOnUiThread {
                try {
                    val intent = AccountManager.newChooseAccountIntent(
                        null, null, arrayOf("com.google"), false, null, null, null, null
                    )
                    startActivityForResult(intent, REQUEST_CODE_PICK_ACCOUNT)
                } catch (e: Exception) {
                    val fallbackIntent = Intent(Intent.ACTION_MAIN).apply {
                        addCategory(Intent.CATEGORY_LAUNCHER)
                    }
                    startActivityForResult(fallbackIntent, REQUEST_CODE_PICK_ACCOUNT)
                }
            }
        }
    }

    inner class AndroidHapticsInterface(private val context: Context) {
        private val vibrator: Vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            manager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        @JavascriptInterface
        fun vibrateLight() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(12, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(12)
            }
        }

        @JavascriptInterface
        fun vibrateMedium() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(28, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(28)
            }
        }

        @JavascriptInterface
        fun vibrateHeavy() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(
                    VibrationEffect.createWaveform(longArrayOf(0, 30, 40, 60), intArrayOf(0, 180, 0, 255), -1)
                )
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(60)
            }
        }

        @JavascriptInterface
        fun vibrateReject() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(
                    VibrationEffect.createWaveform(longArrayOf(0, 20, 40, 20), intArrayOf(0, 200, 0, 200), -1)
                )
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(longArrayOf(0, 20, 40, 20), -1)
            }
        }
    }
}

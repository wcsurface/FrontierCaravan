package app.vercel.frontiercaravan

import android.accounts.AccountManager
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.MediaStore
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.JsPromptResult
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.LinearLayout
import androidx.activity.ComponentActivity
import androidx.core.content.FileProvider
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.MobileAds
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var adView: AdView
    private lateinit var adContainerLayout: LinearLayout
    private val REQUEST_CODE_PICK_ACCOUNT = 1002
    private val FILE_CHOOSER_REQUEST_CODE = 1001

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null

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
        settings.cacheMode = WebSettings.LOAD_NO_CACHE

        webView.clearCache(true)
        webView.setLayerType(View.LAYER_TYPE_NONE, null)

        // WebChromeClient with onShowFileChooser, onJsPrompt, & Console Log forwarding
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                Log.d("LiveLoreConsole", "${consoleMessage?.message()} -- Line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}")
                return true
            }

            override fun onJsPrompt(
                view: WebView?,
                url: String?,
                message: String?,
                defaultValue: String?,
                result: JsPromptResult?
            ): Boolean {
                val builder = android.app.AlertDialog.Builder(this@MainActivity)
                builder.setTitle("Google Sign-In")
                builder.setMessage(message ?: "Enter your Google Email Address:")

                val input = EditText(this@MainActivity)
                input.inputType = android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
                if (!defaultValue.isNullOrEmpty()) {
                    input.setText(defaultValue)
                }
                builder.setView(input)

                builder.setPositiveButton("Sign In") { _, _ ->
                    val userEmail = input.text.toString().trim()
                    result?.confirm(userEmail)
                }
                builder.setNegativeButton("Cancel") { dialog, _ ->
                    dialog.dismiss()
                    result?.cancel()
                }
                builder.setOnCancelListener {
                    result?.cancel()
                }
                builder.show()
                return true
            }

            override fun onShowFileChooser(
                view: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                var takePictureIntent: Intent? = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                if (takePictureIntent?.resolveActivity(packageManager) != null) {
                    var photoFile: File? = null
                    try {
                        photoFile = createImageFile()
                        takePictureIntent.putExtra("PhotoPath", photoFile.absolutePath)
                    } catch (ex: IOException) {
                        // Error occurred while creating the File
                    }

                    if (photoFile != null) {
                        cameraImageUri = FileProvider.getUriForFile(
                            this@MainActivity,
                            "${applicationContext.packageName}.fileprovider",
                            photoFile
                        )
                        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                    } else {
                        takePictureIntent = null
                    }
                }

                val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "image/*"
                }

                val intentArray: Array<Intent> = takePictureIntent?.let { arrayOf(it) } ?: emptyArray()

                val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
                    putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
                    putExtra(Intent.EXTRA_TITLE, "Select Photo Source")
                    putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
                }

                startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE)
                return true
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                view?.evaluateJavascript("document.getElementById('ticket-list') ? document.getElementById('ticket-list').innerHTML : 'NO_ELEMENT'") { result ->
                    Log.d("LiveLoreDebug", "ticket-list HTML: $result")
                }
            }
        }

        // 4. AdMob Banner Container (Hidden by default for VIP members)
        adContainerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#0A0D0E"))
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            visibility = View.GONE
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

    @Throws(IOException::class)
    private fun createImageFile(): File {
        val timeStamp: String = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val storageDir: File? = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile(
            "JPEG_${timeStamp}_",
            ".jpg",
            storageDir
        )
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

        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) return
            var results: Array<Uri>? = null

            if (resultCode == RESULT_OK) {
                if (data == null || data.data == null) {
                    if (cameraImageUri != null) {
                        results = arrayOf(cameraImageUri!!)
                    }
                } else {
                    val dataString = data.dataString
                    if (dataString != null) {
                        results = arrayOf(Uri.parse(dataString))
                    }
                }
            }

            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        } else if (requestCode == REQUEST_CODE_PICK_ACCOUNT) {
            if (resultCode == RESULT_OK && data != null) {
                val accountName = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME)
                    ?: data.getStringExtra("authAccount")
                    ?: data.getStringExtra("accountName")
                if (!accountName.isNullOrEmpty()) {
                    val safeEmail = accountName.lowercase().trim()
                    webView.post {
                        webView.evaluateJavascript("onNativeGoogleAuthSuccess('$safeEmail')", null)
                    }
                } else {
                    webView.post {
                        webView.evaluateJavascript("onNativeGoogleAuthFallback()", null)
                    }
                }
            } else {
                webView.post {
                    webView.evaluateJavascript("onNativeGoogleAuthFallback()", null)
                }
            }
        }
    }

    // Native AdMob Interface
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
                    @Suppress("DEPRECATION")
                    val intent = AccountManager.newChooseAccountIntent(
                        null, null, arrayOf("com.google"), true, null, null, null, null
                    )
                    startActivityForResult(intent, REQUEST_CODE_PICK_ACCOUNT)
                } catch (e: Exception) {
                    try {
                        val intent = Intent("com.google.android.gms.common.account.CHOOSE_ACCOUNT").apply {
                            putExtra("allowableAccountTypes", arrayOf("com.google"))
                            putExtra("alwaysPromptForAccount", true)
                        }
                        startActivityForResult(intent, REQUEST_CODE_PICK_ACCOUNT)
                    } catch (ex: Exception) {
                        webView.post {
                            webView.evaluateJavascript("onNativeGoogleAuthFallback()", null)
                        }
                    }
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

package app.vercel.livelore

import android.accounts.AccountManager
import android.annotation.SuppressLint
import android.content.ContentValues
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
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.core.content.FileProvider
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.MobileAds
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : androidx.appcompat.app.AppCompatActivity() {

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

        // 1. Initialize Google Mobile Ads SDK safely
        try {
            MobileAds.initialize(this) {}
        } catch (e: Throwable) {
            e.printStackTrace()
        }

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
        try { settings.javaScriptEnabled = true } catch (e: Throwable) {}
        try { settings.domStorageEnabled = true } catch (e: Throwable) {}
        try { settings.databaseEnabled = true } catch (e: Throwable) {}
        try { settings.allowFileAccess = true } catch (e: Throwable) {}
        try { settings.allowContentAccess = true } catch (e: Throwable) {}
        try {
            @Suppress("DEPRECATION")
            settings.allowFileAccessFromFileURLs = true
            @Suppress("DEPRECATION")
            settings.allowUniversalAccessFromFileURLs = true
        } catch (e: Throwable) {}
        try { settings.setSupportZoom(false) } catch (e: Throwable) {}
        try { settings.builtInZoomControls = false } catch (e: Throwable) {}
        try { settings.displayZoomControls = false } catch (e: Throwable) {}
        try { settings.cacheMode = WebSettings.LOAD_DEFAULT } catch (e: Throwable) {}

        // WebChromeClient with onShowFileChooser for Camera vs Camera Roll Photo Selection
        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                view: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                var takePictureIntent: Intent? = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                var photoFile: File? = null
                try {
                    photoFile = createImageFile()
                } catch (ex: IOException) {
                    ex.printStackTrace()
                }

                if (photoFile != null) {
                    try {
                        cameraImageUri = FileProvider.getUriForFile(
                            this@MainActivity,
                            "${applicationContext.packageName}.fileprovider",
                            photoFile
                        )
                        takePictureIntent?.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                        takePictureIntent?.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                    } catch (ex: Exception) {
                        ex.printStackTrace()
                        cameraImageUri = null
                        takePictureIntent = null
                    }
                } else {
                    takePictureIntent = null
                }

                val galleryIntent: Intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    Intent(MediaStore.ACTION_PICK_IMAGES).apply {
                        type = "image/*"
                        putExtra(MediaStore.EXTRA_PICK_IMAGES_MAX, 5)
                    }
                } else {
                    Intent(Intent.ACTION_GET_CONTENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "image/*"
                        putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                    }
                }

                val intentArray: Array<Intent> = takePictureIntent?.let { arrayOf(it) } ?: emptyArray()

                val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
                    putExtra(Intent.EXTRA_INTENT, galleryIntent)
                    putExtra(Intent.EXTRA_TITLE, "Select Photos (Up to 5)")
                    putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
                }

                startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE)
                return true
            }
        }

        val onlineUrl = "https://livelore-app.vercel.app"
        val offlineUrl = "file:///android_asset/index.html"

        webView.webViewClient = object : WebViewClient() {
            @Suppress("DEPRECATION")
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                if (failingUrl?.startsWith("https://livelore-app.vercel.app") == true) {
                    webView.post {
                        webView.loadUrl(offlineUrl)
                    }
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                webView.postDelayed({
                    webView.evaluateJavascript("if (window.saveShowsToStorage) { window.saveShowsToStorage(); }", null)
                }, 1000)
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

        // Load Official AdMob Test Banner Ad safely
        try {
            val adRequest = AdRequest.Builder().build()
            adView.loadAd(adRequest)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Assemble Layout
        rootLayout.addView(webView)
        rootLayout.addView(adContainerLayout)
        setContentView(rootLayout)

        // Expose Native Interfaces to JavaScript safely
        try {
            webView.addJavascriptInterface(AndroidHapticsInterface(this), "AndroidHaptics")
            webView.addJavascriptInterface(AndroidGoogleAuthInterface(this), "AndroidGoogleAuth")
            webView.addJavascriptInterface(AndroidAdMobInterface(), "AndroidAdMob")
            webView.addJavascriptInterface(AndroidCSVInterface(this), "AndroidCSV")
            webView.addJavascriptInterface(AndroidShareInterface(this), "AndroidShare")
            webView.addJavascriptInterface(AndroidBillingInterface(this), "AndroidBilling")
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // OTA Live Updates: Load live Vercel web app if online, fallback to asset HTML if offline
        val targetUrl = if (isNetworkAvailable(this)) onlineUrl else offlineUrl
        webView.loadUrl(targetUrl)
    }

    private fun isNetworkAvailable(context: Context): Boolean {
        try {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as android.net.ConnectivityManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val network = connectivityManager.activeNetwork ?: return false
                val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
                return capabilities.hasCapability(android.net.NetworkCapabilities.NET_CAPABILITY_INTERNET)
            } else {
                @Suppress("DEPRECATION")
                val activeNetworkInfo = connectivityManager.activeNetworkInfo
                return activeNetworkInfo != null && activeNetworkInfo.isConnected
            }
        } catch (e: Exception) {
            return true
        }
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
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                window.setDecorFitsSystemWindows(false)
                window.insetsController?.let { controller ->
                    controller.hide(android.view.WindowInsets.Type.statusBars() or android.view.WindowInsets.Type.navigationBars())
                    controller.systemBarsBehavior = android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                }
            } else {
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
        } catch (e: Throwable) {
            e.printStackTrace()
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    override fun onResume() {
        super.onResume()
        try {
            if (::adView.isInitialized) adView.resume()
        } catch (e: Throwable) {}
    }

    override fun onPause() {
        try {
            if (::adView.isInitialized) adView.pause()
        } catch (e: Throwable) {}
        super.onPause()
    }

    override fun onDestroy() {
        try {
            if (::adView.isInitialized) adView.destroy()
        } catch (e: Throwable) {}
        super.onDestroy()
    }

    private fun isFileNotEmpty(uri: Uri): Boolean {
        return try {
            val pfd = contentResolver.openFileDescriptor(uri, "r")
            val size = pfd?.statSize ?: 0L
            pfd?.close()
            size > 0L
        } catch (e: Exception) {
            false
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) return
            var results: Array<Uri>? = null

            if (resultCode == RESULT_OK) {
                if (cameraImageUri != null && isFileNotEmpty(cameraImageUri!!)) {
                    results = arrayOf(cameraImageUri!!)
                } else if (data != null) {
                    if (data.clipData != null) {
                        val count = data.clipData!!.itemCount
                        val uriList = mutableListOf<Uri>()
                        for (i in 0 until count) {
                            uriList.add(data.clipData!!.getItemAt(i).uri)
                        }
                        results = uriList.toTypedArray()
                    } else if (data.data != null) {
                        results = arrayOf(data.data!!)
                    }
                } else if (cameraImageUri != null) {
                    results = arrayOf(cameraImageUri!!)
                }
            }

            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
            cameraImageUri = null
        } else if (requestCode == REQUEST_CODE_PICK_ACCOUNT) {
            if (resultCode == RESULT_OK && data != null) {
                var extractedEmail: String? = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME)
                    ?: data.getStringExtra("authAccount")
                    ?: data.getStringExtra("accountName")

                if (extractedEmail.isNullOrEmpty() && data.extras != null) {
                    try {
                        for (key in data.extras!!.keySet()) {
                            val valStr = data.extras!!.get(key)?.toString()
                            if (!valStr.isNullOrEmpty() && valStr.contains("@")) {
                                extractedEmail = valStr
                                break
                            }
                        }
                    } catch (e: Exception) {}
                }

                if (!extractedEmail.isNullOrEmpty()) {
                    val safeEmail = extractedEmail.lowercase().trim()
                    webView.post {
                        webView.evaluateJavascript("if(typeof window.onNativeGoogleAuthSuccess==='function'){window.onNativeGoogleAuthSuccess('$safeEmail');}", null)
                    }
                } else {
                    webView.post {
                        webView.evaluateJavascript("if(typeof window.onNativeGoogleAuthFallback==='function'){window.onNativeGoogleAuthFallback();}", null)
                    }
                }
            } else {
                webView.post {
                    webView.evaluateJavascript("if(typeof window.onNativeGoogleAuthFallback==='function'){window.onNativeGoogleAuthFallback();}", null)
                }
            }
        }
    }

    // Native AdMob Interface
    inner class AndroidAdMobInterface {
        @JavascriptInterface
        fun showBannerAd() {
            runOnUiThread {
                try {
                    if (::adContainerLayout.isInitialized) {
                        adContainerLayout.visibility = View.VISIBLE
                    }
                } catch (e: Throwable) {}
            }
        }

        @JavascriptInterface
        fun hideBannerAd() {
            runOnUiThread {
                try {
                    if (::adContainerLayout.isInitialized) {
                        adContainerLayout.visibility = View.GONE
                    }
                } catch (e: Throwable) {}
            }
        }
    }

    inner class AndroidCSVInterface(private val context: Context) {
        @JavascriptInterface
        fun shareCsv(csvData: String, fileName: String) {
            runOnUiThread {
                try {
                    val cleanFileName = if (fileName.endsWith(".csv")) fileName else "$fileName.csv"
                    var savedSuccessfully = false

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        val resolver = context.contentResolver
                        val contentValues = ContentValues().apply {
                            put(MediaStore.MediaColumns.DISPLAY_NAME, cleanFileName)
                            put(MediaStore.MediaColumns.MIME_TYPE, "text/csv")
                            put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                        }

                        val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                        if (uri != null) {
                            resolver.openOutputStream(uri)?.use { stream ->
                                stream.write(csvData.toByteArray())
                            }
                            savedSuccessfully = true
                        }
                    } else {
                        @Suppress("DEPRECATION")
                        val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                        if (!downloadsDir.exists()) downloadsDir.mkdirs()
                        val file = File(downloadsDir, cleanFileName)
                        file.writeText(csvData)
                        savedSuccessfully = true
                    }

                    if (savedSuccessfully) {
                        Toast.makeText(
                            context,
                            "✓ Saved to Downloads: $cleanFileName",
                            Toast.LENGTH_LONG
                        ).show()
                    } else {
                        Toast.makeText(context, "Failed to save CSV to Downloads", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                    Toast.makeText(context, "Error saving CSV: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    inner class AndroidShareInterface(private val context: Context) {
        @JavascriptInterface
        fun shareText(text: String, title: String) {
            runOnUiThread {
                try {
                    val sendIntent = Intent().apply {
                        action = Intent.ACTION_SEND
                        putExtra(Intent.EXTRA_TEXT, text)
                        type = "text/plain"
                    }
                    val shareIntent = Intent.createChooser(sendIntent, if (title.isNotEmpty()) title else "Share Concert")
                    context.startActivity(shareIntent)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }

        @JavascriptInterface
        fun shareImageAndText(dataUrl: String, text: String, title: String) {
            runOnUiThread {
                try {
                    var imageUri: Uri? = null
                    if (dataUrl.startsWith("data:image")) {
                        val base64Data = dataUrl.substring(dataUrl.indexOf(",") + 1)
                        val decodedBytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT)
                        val imagesDir = File(context.cacheDir, "shared_images")
                        if (!imagesDir.exists()) imagesDir.mkdirs()
                        val imageFile = File(imagesDir, "concert_share_${System.currentTimeMillis()}.jpg")
                        imageFile.writeBytes(decodedBytes)
                        imageUri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", imageFile)
                    }

                    val sendIntent = Intent().apply {
                        action = Intent.ACTION_SEND
                        putExtra(Intent.EXTRA_TEXT, text)
                        if (imageUri != null) {
                            putExtra(Intent.EXTRA_STREAM, imageUri)
                            type = "image/*"
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        } else {
                            type = "text/plain"
                        }
                    }
                    val shareIntent = Intent.createChooser(sendIntent, if (title.isNotEmpty()) title else "Share Concert")
                    context.startActivity(shareIntent)
                } catch (e: Exception) {
                    e.printStackTrace()
                    shareText(text, title)
                }
            }
        }

        @JavascriptInterface
        fun shareMultipleImagesAndText(dataUrlsJson: String, text: String, title: String) {
            runOnUiThread {
                try {
                    val imageUris = ArrayList<Uri>()
                    val gson = com.google.gson.Gson()
                    val typeToken = object : com.google.gson.reflect.TypeToken<List<String>>() {}.type
                    val dataUrls: List<String> = gson.fromJson(dataUrlsJson, typeToken) ?: emptyList()

                    val imagesDir = File(context.cacheDir, "shared_images")
                    if (!imagesDir.exists()) imagesDir.mkdirs()

                    for ((index, url) in dataUrls.withIndex()) {
                        if (url.startsWith("data:image")) {
                            val base64Data = url.substring(url.indexOf(",") + 1)
                            val decodedBytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT)
                            val imageFile = File(imagesDir, "concert_share_${System.currentTimeMillis()}_$index.jpg")
                            imageFile.writeBytes(decodedBytes)
                            val u = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", imageFile)
                            imageUris.add(u)
                        }
                    }

                    if (imageUris.isNotEmpty()) {
                        val sendIntent = Intent().apply {
                            action = Intent.ACTION_SEND_MULTIPLE
                            putExtra(Intent.EXTRA_TEXT, text)
                            putParcelableArrayListExtra(Intent.EXTRA_STREAM, imageUris)
                            type = "image/*"
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        }
                        val shareIntent = Intent.createChooser(sendIntent, if (title.isNotEmpty()) title else "Share Concert")
                        context.startActivity(shareIntent)
                    } else {
                        shareText(text, title)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                    shareText(text, title)
                }
            }
        }
    }

    inner class AndroidBillingInterface(private val context: Context) : PurchasesUpdatedListener {
        private lateinit var billingClient: BillingClient
        private val VIP_PRODUCT_ID = "vip_pass_499"

        init {
            try {
                billingClient = BillingClient.newBuilder(context)
                    .setListener(this)
                    .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                    .build()
                startConnection()
            } catch (e: Throwable) {
                e.printStackTrace()
            }
        }

        private fun startConnection(onConnected: (() -> Unit)? = null) {
            if (!::billingClient.isInitialized) return
            try {
                billingClient.startConnection(object : BillingClientStateListener {
                    override fun onBillingSetupFinished(billingResult: BillingResult) {
                        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                            queryExistingPurchases()
                            onConnected?.invoke()
                        }
                    }

                    override fun onBillingServiceDisconnected() {
                        // Re-connect on next action
                    }
                })
            } catch (e: Throwable) {
                e.printStackTrace()
            }
        }

        private fun queryExistingPurchases() {
            if (!::billingClient.isInitialized || !billingClient.isReady) return
            try {
                val params = QueryPurchasesParams.newBuilder()
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build()

                billingClient.queryPurchasesAsync(params) { billingResult, purchases ->
                    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
                        for (purchase in purchases) {
                            if (purchase.products.contains(VIP_PRODUCT_ID) && purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                                handlePurchaseSuccess(purchase)
                            }
                        }
                    }
                }
            } catch (e: Throwable) {
                e.printStackTrace()
            }
        }

        @JavascriptInterface
        fun launchVipPurchase() {
            runOnUiThread {
                if (!::billingClient.isInitialized) {
                    webView.post {
                        webView.evaluateJavascript("onNativeVipPurchaseFallback()", null)
                    }
                    return@runOnUiThread
                }

                if (!billingClient.isReady) {
                    startConnection { launchVipPurchase() }
                    return@runOnUiThread
                }

                try {
                    val productList = listOf(
                        QueryProductDetailsParams.Product.newBuilder()
                            .setProductId(VIP_PRODUCT_ID)
                            .setProductType(BillingClient.ProductType.INAPP)
                            .build()
                    )

                    val params = QueryProductDetailsParams.newBuilder()
                        .setProductList(productList)
                        .build()

                    billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsResult ->
                        val list = productDetailsResult.productDetailsList
                        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && !list.isNullOrEmpty()) {
                            val productDetails = list[0]
                            val flowParams = BillingFlowParams.newBuilder()
                                .setProductDetailsParamsList(
                                    listOf(
                                        BillingFlowParams.ProductDetailsParams.newBuilder()
                                            .setProductDetails(productDetails)
                                            .build()
                                    )
                                )
                                .build()

                            billingClient.launchBillingFlow(this@MainActivity, flowParams)
                        } else {
                            webView.post {
                                webView.evaluateJavascript("onNativeVipPurchaseFallback()", null)
                            }
                        }
                    }
                } catch (e: Throwable) {
                    webView.post {
                        webView.evaluateJavascript("onNativeVipPurchaseFallback()", null)
                    }
                }
            }
        }

        @JavascriptInterface
        fun restoreVipPurchase() {
            runOnUiThread {
                if (!::billingClient.isInitialized) return@runOnUiThread
                if (!billingClient.isReady) {
                    startConnection { restoreVipPurchase() }
                    return@runOnUiThread
                }
                queryExistingPurchases()
            }
        }

        override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
                for (purchase in purchases) {
                    handlePurchaseSuccess(purchase)
                }
            } else if (billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
                // Flow cancelled by user
            } else {
                webView.post {
                    webView.evaluateJavascript("onNativeVipPurchaseFallback()", null)
                }
            }
        }

        private fun handlePurchaseSuccess(purchase: Purchase) {
            if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                if (!purchase.isAcknowledged && ::billingClient.isInitialized) {
                    try {
                        val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                            .setPurchaseToken(purchase.purchaseToken)
                            .build()
                        billingClient.acknowledgePurchase(acknowledgePurchaseParams) { _ -> }
                    } catch (e: Throwable) {}
                }

                webView.post {
                    webView.evaluateJavascript("if(typeof window.onNativeVipPurchaseSuccess==='function'){window.onNativeVipPurchaseSuccess();}", null)
                }
            }
        }
    }

    inner class AndroidGoogleAuthInterface(private val context: Context) {
        @JavascriptInterface
        fun launchGoogleSignIn() {
            runOnUiThread {
                try {
                    val am = AccountManager.get(this@MainActivity)
                    val accounts = am.getAccountsByType("com.google")
                    if (accounts.isNotEmpty() && !accounts[0].name.isNullOrEmpty()) {
                        val selectedEmail = accounts[0].name.lowercase().trim()
                        webView.post {
                            webView.evaluateJavascript("if(typeof window.onNativeGoogleAuthSuccess==='function'){window.onNativeGoogleAuthSuccess('$selectedEmail');}", null)
                        }
                        return@runOnUiThread
                    }
                } catch (e: Exception) {}

                webView.post {
                    webView.evaluateJavascript("if(typeof window.onNativeGoogleAuthFallback==='function'){window.onNativeGoogleAuthFallback();}", null)
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

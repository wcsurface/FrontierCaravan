package app.vercel.frontiercaravan

import android.annotation.SuppressLint
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var bridge: AndroidNativeBridge
    private var connectivityManager: ConnectivityManager? = null
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    private val liveUrl = "https://frontiercaravan.vercel.app"
    private val offlineAssetUrl = "file:///android_asset/index.html"
    private var isUsingOfflineFallback = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable Hardware Acceleration explicitly on window
        window.setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        )

        // Configure edge-to-edge & fullscreen
        WindowCompat.setDecorFitsSystemWindows(window, false)
        hideSystemUI(window)

        // Initialize WebView
        webView = WebView(this).apply {
            setLayerType(View.LAYER_TYPE_HARDWARE, null)
        }
        setContentView(webView)

        setupWebViewSettings()

        bridge = AndroidNativeBridge(this, webView)
        webView.addJavascriptInterface(bridge, "AndroidBridge")

        setupWebViewClients()
        setupOnBackPressed()
        setupNetworkMonitoring()

        // Initial load check
        if (bridge.isNetworkAvailable()) {
            loadLiveUrl()
        } else {
            loadOfflineFallback()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebViewSettings() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            mediaPlaybackRequiresUserGesture = false

            // Safe Browsing & Mixed Content standard security flags
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                safeBrowsingEnabled = true
            }

            cacheMode = WebSettings.LOAD_DEFAULT
        }
    }

    private fun setupWebViewClients() {
        webView.webChromeClient = object : WebChromeClient() {
            // WebChromeClient customizations if needed
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                // Keep inside webview for both live site and local offline assets
                return !(url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file:///"))
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true && !isUsingOfflineFallback) {
                    loadOfflineFallback()
                }
            }
        }
    }

    private fun loadLiveUrl() {
        isUsingOfflineFallback = false
        webView.loadUrl(liveUrl)
    }

    private fun loadOfflineFallback() {
        isUsingOfflineFallback = true
        webView.loadUrl(offlineAssetUrl)
    }

    private fun setupNetworkMonitoring() {
        connectivityManager = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()

        networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                runOnUiThread {
                    bridge.notifyOnlineStatusChanged(true)
                    if (isUsingOfflineFallback) {
                        loadLiveUrl()
                    }
                }
            }

            override fun onLost(network: Network) {
                runOnUiThread {
                    bridge.notifyOnlineStatusChanged(false)
                    if (!isUsingOfflineFallback) {
                        loadOfflineFallback()
                    }
                }
            }
        }

        connectivityManager?.registerNetworkCallback(request, networkCallback!!)
    }

    private fun setupOnBackPressed() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun hideSystemUI(window: Window) {
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        controller.hide(WindowInsetsCompat.Type.systemBars())
    }

    override fun onResume() {
        super.onResume()
        hideSystemUI(window)
        webView.onResume()
    }

    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        networkCallback?.let {
            connectivityManager?.unregisterNetworkCallback(it)
        }
        webView.destroy()
        super.onDestroy()
    }
}

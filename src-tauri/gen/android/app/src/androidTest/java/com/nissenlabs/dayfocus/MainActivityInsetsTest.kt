package com.nissenlabs.dayfocus

import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.os.SystemClock
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.json.JSONArray
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@RunWith(AndroidJUnit4::class)
class MainActivityInsetsTest {
  @Test
  fun webViewStaysInsideSafeAreaAndNarrowCardsKeepReadableText() {
    assertEquals("Run this standalone test with activity cleanup deferred until after reporting",
      "false", InstrumentationRegistry.getArguments().getString("waitForActivitiesToComplete"))
    // Closing the last Tauri activity exits the instrumented process before the
    // runner can report its result. The runbook stops the app after reporting.
    ActivityScenario.launch(MainActivity::class.java).let { scenario ->
      InstrumentationRegistry.getInstrumentation().waitForIdleSync()
      lateinit var appWebView: WebView
      scenario.onActivity { activity ->
        val content = activity.findViewById<ViewGroup>(android.R.id.content)
        val windowInsets = ViewCompat.getRootWindowInsets(content)
        assertNotNull("The resumed activity must have window insets", windowInsets)
        val safeArea = windowInsets!!.getInsets(
          WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
        )
        assertEquals(safeArea.left, content.paddingLeft)
        assertEquals(safeArea.top, content.paddingTop)
        assertEquals(safeArea.right, content.paddingRight)
        assertEquals(safeArea.bottom, content.paddingBottom)

        val webView = findWebView(content)
        assertNotNull("The actual Tauri WebView must be present", webView)
        assertTrue("WebView must be laid out", webView!!.width > 0 && webView.height > 0)
        appWebView = webView
        val webLocation = IntArray(2)
        val contentLocation = IntArray(2)
        webView.getLocationOnScreen(webLocation)
        content.getLocationOnScreen(contentLocation)
        assertTrue(webLocation[0] >= contentLocation[0] + safeArea.left)
        assertTrue(webLocation[1] >= contentLocation[1] + safeArea.top)
        assertTrue(webLocation[0] + webView.width <= contentLocation[0] + content.width - safeArea.right)
        assertTrue(webLocation[1] + webView.height <= contentLocation[1] + content.height - safeArea.bottom)
      }

      val deadline = SystemClock.uptimeMillis() + 10_000
      while (evaluate(appWebView, "Boolean(document.querySelector('.app'))") != "true") {
        assertTrue("The local planner must finish loading", SystemClock.uptimeMillis() < deadline)
        SystemClock.sleep(50)
      }
      assertEquals("Android must disclose and disable unsupported export", "true", evaluate(appWebView, """
        Boolean(document.querySelector('.header-export-note')) &&
        [...document.querySelectorAll('button')].find(button => button.textContent === 'Export').disabled
      """.trimIndent()))
      if (evaluate(appWebView, "matchMedia('(max-width: 900px)').matches") == "true") {
        // A temporary geometry fixture exercises the shipped CSS without
        // reading or changing any saved planner tasks.
        val geometry = JSONArray(evaluate(appWebView, """
          (() => {
            const host = document.createElement('div');
            host.style.cssText = 'position:fixed;width:250px;visibility:hidden';
            const card = document.createElement('div');
            card.className = 'task-item';
            for (const cls of ['task-drag-handle','task-checkbox','task-category-chip','task-edit','task-priority','task-delete']) {
              const button = document.createElement('button');
              button.className = cls;
              button.textContent = '+';
              card.append(button);
            }
            const text = document.createElement('span');
            text.className = 'task-text';
            text.textContent = 'Fictional narrow-card layout check';
            card.append(text);
            host.append(card);
            document.body.append(host);
            const width = text.getBoundingClientRect().width;
            const touchAction = getComputedStyle(card.querySelector('.task-drag-handle')).touchAction;
            host.remove();
            return [width, touchAction];
          })()
        """.trimIndent()))
        assertTrue("Task text must not collapse between action buttons", geometry.getDouble(0) >= 200)
        assertEquals("Only the drag handle must suppress native panning", "none", geometry.getString(1))
      }
    }
  }

  private fun evaluate(webView: WebView, script: String): String {
    val ready = CountDownLatch(1)
    var result = "null"
    InstrumentationRegistry.getInstrumentation().runOnMainSync {
      webView.evaluateJavascript(script) {
        result = it
        ready.countDown()
      }
    }
    assertTrue("WebView evaluation must complete", ready.await(5, TimeUnit.SECONDS))
    return result
  }

  private fun findWebView(view: View): WebView? {
    if (view is WebView) return view
    if (view is ViewGroup) {
      for (index in 0 until view.childCount) {
        findWebView(view.getChildAt(index))?.let { return it }
      }
    }
    return null
  }
}

package com.nissenlabs.dayfocus

import android.os.Bundle
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.core.graphics.Insets
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    val content = findViewById<View>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, windowInsets ->
      val safeAreaTypes = WindowInsetsCompat.Type.systemBars() or
        WindowInsetsCompat.Type.displayCutout()
      val safeArea = windowInsets.getInsets(safeAreaTypes)
      view.setPadding(safeArea.left, safeArea.top, safeArea.right, safeArea.bottom)

      // The native container owns these insets. Forward zero values so WebView
      // cannot apply them twice, while preserving keyboard inset updates.
      WindowInsetsCompat.Builder(windowInsets)
        .setInsets(safeAreaTypes, Insets.NONE)
        .build()
    }
    ViewCompat.requestApplyInsets(content)
  }
}

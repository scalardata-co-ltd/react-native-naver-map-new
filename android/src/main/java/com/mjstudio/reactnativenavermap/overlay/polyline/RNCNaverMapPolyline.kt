package com.mjstudio.reactnativenavermap.overlay.polyline

import android.annotation.SuppressLint
import com.facebook.react.uimanager.ThemedReactContext
import com.mjstudio.reactnativenavermap.event.NaverMapOverlayTapEvent
import com.mjstudio.reactnativenavermap.overlay.RNCNaverMapOverlay
import com.mjstudio.reactnativenavermap.util.emitEvent
import com.naver.maps.map.NaverMap
import com.naver.maps.map.overlay.PolylineOverlay

@SuppressLint("ViewConstructor")
class RNCNaverMapPolyline(val reactContext: ThemedReactContext) :
  RNCNaverMapOverlay<PolylineOverlay>(reactContext) {
  override val overlay: PolylineOverlay by lazy {
    PolylineOverlay().apply {
      setOnClickListener {
        reactContext.emitEvent(id) { surfaceId, reactTag ->
          NaverMapOverlayTapEvent(
            surfaceId,
            reactTag,
          )
        }
        true
      }
    }
  }

  override fun addToMap(map: NaverMap) {
    overlay.map = map
  }

  override fun removeFromMap(map: NaverMap) {
    overlay.map = null
  }

  override fun onDropViewInstance() {
    overlay.map = null
    overlay.onClickListener = null
  }
}

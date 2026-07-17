import React from 'react';
import { StatusBar, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { gameHtml } from './assets/gameHtml';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#05070F' }}>
      <StatusBar hidden />
      <WebView
        source={{ html: gameHtml, baseUrl: '' }}
        style={{ flex: 1, backgroundColor: '#05070F' }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
      />
    </View>
  );
}

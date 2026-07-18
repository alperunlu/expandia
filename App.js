import React from 'react';
import { StatusBar, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { gameHtmlBase64 } from './assets/gameHtml';

export default function App() {
  const htmlUri = 'data:text/html;base64,' + gameHtmlBase64;

  return (
    <View style={{ flex: 1, backgroundColor: '#05070F' }}>
      <StatusBar hidden />
      <WebView
        source={{ uri: htmlUri }}
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
      />
    </View>
  );
}

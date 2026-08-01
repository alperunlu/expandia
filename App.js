import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { gameHtml } from './assets/gameHtml';

let crashListeners = [];
let lastError = null;

function reportCrash(message, stack) {
  lastError = { message: String(message || ''), stack: String(stack || '') };
  crashListeners.forEach((fn) => fn(lastError));
}

if (global.ErrorUtils) {
  const defaultHandler = global.ErrorUtils.getGlobalHandler
    ? global.ErrorUtils.getGlobalHandler()
    : null;
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    reportCrash(error && error.message, error && error.stack);
    // Swallow fatal errors instead of letting RN abort the process, so we can see what broke.
    if (!isFatal && defaultHandler) defaultHandler(error, isFatal);
  });
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    reportCrash(error && error.message, error && error.stack);
  }
  render() {
    if (this.state.error) {
      return <CrashScreen message={this.state.error.message} stack={this.state.error.stack} />;
    }
    return this.props.children;
  }
}

function CrashScreen({ message, stack }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#05070F', paddingTop: 60, paddingHorizontal: 16 }}>
      <StatusBar hidden={false} />
      <Text style={{ color: '#FF2D9B', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        Expandia crashed — debug info
      </Text>
      <ScrollView>
        <Text selectable style={{ color: '#C9D6FF', fontSize: 12 }}>
          {String(message || '')}
          {'\n\n'}
          {String(stack || '')}
        </Text>
      </ScrollView>
    </View>
  );
}

function Game() {
  const [crash, setCrash] = useState(lastError);

  useEffect(() => {
    const fn = (err) => setCrash(err);
    crashListeners.push(fn);
    return () => { crashListeners = crashListeners.filter((f) => f !== fn); };
  }, []);

  if (crash) {
    return <CrashScreen message={crash.message} stack={crash.stack} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#05070F' }}>
      <StatusBar hidden />
      <WebView
        // Must be `html`, not a data: URI — see scripts/bundle-game.js
        source={{ html: gameHtml }}
        originWhitelist={['*']}
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
        onError={(e) => reportCrash('WebView onError: ' + JSON.stringify(e.nativeEvent))}
        onHttpError={(e) => reportCrash('WebView onHttpError: ' + JSON.stringify(e.nativeEvent))}
        onRenderProcessGone={(e) => reportCrash('WebView onRenderProcessGone: ' + JSON.stringify(e.nativeEvent))}
      />
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Game />
    </ErrorBoundary>
  );
}

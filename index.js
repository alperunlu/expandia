import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and sets up the Expo runtime. Without it the native side finds no registered
// root component at launch and aborts.
registerRootComponent(App);

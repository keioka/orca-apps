import { registerRootComponent } from 'expo';
import { startNetworkLogging } from 'react-native-network-logger';
import 'react-native-gesture-handler';

import App from './App';

if (process.env.NODE_ENV === 'development') {
  startNetworkLogging();
}
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

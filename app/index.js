import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

// Must be registered before AppRegistry.registerComponent
messaging().setBackgroundMessageHandler(async () => {
  // FCM delivers the notification natively in background/quit state.
  // No additional JS handling needed for basic push display.
});

AppRegistry.registerComponent(appName, () => App);

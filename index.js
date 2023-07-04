// import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

// registerRootComponent(App);

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    if (remoteMessage.data.category == 'successful') {
        await AsyncStorage.setItem("remoteMessage", remoteMessage.data.order);
    } else if (remoteMessage.data.category == 'new_stock') {
        await AsyncStorage.setItem("remoteMessage", remoteMessage.data.category);
    }
    console.log('Message handled in the background!', remoteMessage);
});

function HeadlessCheck({ isHeadless }) { // ios
    if (isHeadless) {
        console.log('isHeadless');
        console.log(isHeadless);
        return null;
    }

    return <App />;
}

AppRegistry.registerComponent('main', () => HeadlessCheck);
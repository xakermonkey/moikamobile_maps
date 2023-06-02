import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Raleway_400Regular, Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

import LoginScreen from './screens/LoginScreen';
import DataScreen from './screens/DataScreen';
import VerificationCodeScreen from './screens/VerificationCodeScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import HowItWorksScreen from './screens/HowItWorksScreen';

import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';

const Stack = createNativeStackNavigator();

export default function App() {

  const notificationListener = useRef();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
  useEffect(() => {
    setNotificationChannel();
    messaging().onMessage(async remoteMessage => {
      console.log('FBremoteMessage');
      console.log(remoteMessage);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          data: remoteMessage.data,
          // categoryIdentifier: remoteMessage.notification.data,
        },
        trigger: null, // Передайте null, чтобы уведомление было показано немедленно
      });
    });
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // console.log('expo addNotificationReceivedListener');
      // console.log(notification);
    });
    // notificationListener = firebase.notifications().onNotification((notification) => {
    //   console.log('notification2');
    //   console.log(notification);
    // });
  }, []);

  const setNotificationChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('notifications', {
        name: 'Уведомления',
        sound: true,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  let [fontsLoaded] = useFonts({
    Raleway_400Regular, Raleway_700Bold, Montserrat_400Regular, Montserrat_700Bold,
  });
  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login' >
        <Stack.Screen name="Login" component={LoginScreen} options={{
          headerShown: false,
        }} />
        <Stack.Screen name="how_it_works" component={HowItWorksScreen} />
        <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} options={{
          title: '', // Код из СМС
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#6E7476',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Raleway_700Bold',
          },
          //   navigationOptions: ({ navigation }) => 
          //   ({ headerLeft: () => (
          //     <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
          //       <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
          //     </TouchableOpacity>
          //   ),
          // })
        }} />
        <Stack.Screen name="Data" component={DataScreen} options={{
          title: 'ВАШИ ДАННЫЕ',
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#6E7476',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Raleway_700Bold',
          },
          // navigationOptions: ({ navigation }) => 
          // ({ headerLeft: () => (
          // <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} activeOpacity={0.7}>
          // <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
          // </TouchableOpacity>
          // ),
          // })
        }} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} options={{
          headerShown: false,
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}

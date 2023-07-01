import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';

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
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as SplashScreen from "expo-splash-screen";

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {

  const [push, setPush] = useState(null);

  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem("sorted", "0");
      await AsyncStorage.setItem("filters", "[]");
    })();

    setNotificationChannel();

    messaging().onMessage(async remoteMessage => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          data: remoteMessage.data,
        },
        trigger: null,
      });
    });


    messaging().setBackgroundMessageHandler(async remoteMessage => {
      setPush(remoteMessage);
      return;
    });

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

  // const componentDidMount = () => {
  //   // Hides native splash screen after 2s
  //   setTimeout(async () => {
  //     await SplashScreen.hideAsync();
  //   }, 2000);
  // }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
      // onReady={componentDidMount} 
      >
        <Stack.Navigator initialRouteName='Login' >
          <Stack.Screen name="Login" component={LoginScreen} options={{
            headerShown: false,
          }} />
          <Stack.Screen name="how_it_works" component={HowItWorksScreen} />
          <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} options={{
            title: '',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: '#6E7476',
            },
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
          }} />
          <Stack.Screen name="MainMenu" component={MainMenuScreen} initialParams={{ push: push }} options={{
            headerShown: false,
          }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );

}

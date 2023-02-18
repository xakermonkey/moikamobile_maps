import 'react-native-gesture-handler';
import React, { useEffect, useLayoutEffect, useState } from 'react';

// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Raleway_400Regular, Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

// import AppLoading from 'expo-splash-screen';

import LoginScreen from './screens/LoginScreen';
import DataScreen from './screens/DataScreen';
import VerificationCodeScreen from './screens/VerificationCodeScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import HowItWorksScreen from './screens/HowItWorksScreen';
// const Stack = createStackNavigator();
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    console.log(data);
    if (error) {
      console.log("error occurred");
    }
    if (data) {
      console.log("data-----", data);
    }
  }
);

const Stack = createNativeStackNavigator();

export default function App() {
  
  let [fontsLoaded] = useFonts({
    Raleway_400Regular, Raleway_700Bold, Montserrat_400Regular, Montserrat_700Bold,
  });
  if (!fontsLoaded) {
    return null;
  }
  // if (!fontsLoaded) {
  //   SplashScreen.preventAutoHideAsync();
  //   return <View />
  // }
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

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

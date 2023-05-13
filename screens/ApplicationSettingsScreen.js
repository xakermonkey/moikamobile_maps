import React from 'react';
import ApplicationSettings from '../components/ApplicationSettings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

function ApplicationSettingsScreen({ navigation }) {
  return (
    <Stack.Navigator >
        <Stack.Screen name="ApplicationSettingsScreen" component={ApplicationSettings} options={{
          title: 'НАСТРОЙКИ',
          // headerShown: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#6E7476',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontFamily: 'Raleway_700Bold',
          },
          headerLeft: () => (
            <TouchableOpacity style={{ left: Platform.OS == 'ios' ? 0 : 0 }} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.7} >
              <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
              </TouchableOpacity>
          ),
        }} />
      </Stack.Navigator>
  );
}

export default ApplicationSettingsScreen

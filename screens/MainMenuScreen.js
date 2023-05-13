import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useWindowDimensions } from 'react-native';

import { DrawerContent } from './DrawerContent';
import MapScreen from './MapScreen';
import HowItWorksScreen from './HowItWorksScreen';
import FaQScreen from './FaQScreen';
import PersonalAccountScreen from './PersonalAccountScreen';
import FeedbackScreen from './FeedbackScreen';
import ApplicationSettingsScreen from './ApplicationSettingsScreen';

import CatalogScreen from './CatalogScreen';

import SuccessfulOrder from './SuccessfulOrder';
import MakingOrderScreen from '../components/MakingOrderScreen';


const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function MainMenuScreen({ navigation }) {
  const dimensions = useWindowDimensions();

  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent { ...props } /> } screenOptions={{
      drawerType: dimensions.width >= 768 ? 'permanent' : 'front',
      drawerStyle: {
        backgroundColor: '#6E7476',
        width: '84%',
        height:'100%'
      },
      drawerActiveTintColor: '#fff',
      drawerInactiveTintColor: '#fff',
      
    }}>
      <Drawer.Screen name="Map" component={MapScreen} options={{
        headerShown: false,
      }} />
      <Drawer.Screen name="HowItWorks" component={HowItWorksScreen} options={{
        headerStyle: {
          backgroundColor: '#6E7476',
        },
        headerTitleStyle: {
          color: '#fff',
          textTransform: 'uppercase',
        },
      }} />
      <Drawer.Screen name="AnsQues" component={FaQScreen} options={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#6E7476',
        },
        headerTitleStyle: {
          color: '#fff',
          textTransform: 'uppercase',
        }
      }} />
      <Drawer.Screen name="Catalog" component={CatalogScreen} options={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#6E7476',
        },
        headerTitleStyle: {
          color: '#fff',
          textTransform: 'uppercase',
        },
        }} />
        


      <Drawer.Screen name="PersonalAccount" component={PersonalAccountScreen} options={{
          headerShown: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#6E7476',
          },
          headerTitleStyle: {
            color: '#fff',
            textTransform: 'uppercase',
          },
        }} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} options={{
        headerShown: false,
      }} />
      <Drawer.Screen name="ApplicationSettings" component={ApplicationSettingsScreen} options={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#6E7476',
        },
        headerTitleStyle: {
          color: '#fff',
          textTransform: 'uppercase',
        },
      }} />

<Drawer.Screen name="PointCarWashDrawer" component={MakingOrderScreen} options={{
        headerShown: false,
      }} />

<Drawer.Screen name="Successful" component={SuccessfulOrder} options={{
  swipeEnabled: false,
        headerShown: false,
        headerStyle: {
          backgroundColor: '#6E7476',
        },
        headerTitleStyle: {
          color: '#fff',
          textTransform: 'uppercase',
        }
      }} />
    </Drawer.Navigator>
  );
}

export default MainMenuScreen

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
import PointCarWash from '../components/PointCarWash';

import GeneralPriceList from '../components/GeneralPriceList';
import PriceListFor from '../components/PriceListFor';
import SelectDate from '../components/SelectDate';
import SelectCar from '../components/SelectCar';
import SelectPaymentMethod from '../components//SelectPaymentMethod';
import OrderСompletion from '../components/OrderСompletion';
import { NavigationContainer } from '@react-navigation/native';
import MakingOrderScreen from '../components/MakingOrderScreen';


const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function MainMenuScreen({ navigation }) {
  const dimensions = useWindowDimensions();

  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent { ...props } /> } screenOptions={{
      drawerType: dimensions.width >= 768 ? 'permanent' : 'front',
      // headerShown: false,
      drawerStyle: {
        backgroundColor: '#6E7476',
        width: '84%',
        height:'100%'
        // zIndex:30000,
      },
      drawerActiveTintColor: '#fff',
      drawerInactiveTintColor: '#fff',
      
    }}>
      <Drawer.Screen name="Map" component={MapScreen} options={{
        headerShown: false,
        // headerStyle: {
        //   backgroundColor: '#6E7476',
        // },
        // headerTitleStyle: {
        //   color: '#fff',
        //   textTransform: 'uppercase',
        // }
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
        // title: 'FAQ',
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
        // headerStyle: {
        //   backgroundColor: '#6E7476',
        // },
        // headerTitleStyle: {
        //   color: '#fff',
        //   textTransform: 'uppercase',
        // },
        // headerLeft: () => (
        //   <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())          } activeOpacity={0.7} >
        //     <Ionicons name='chevron-back' size={28} color={'#000000'} />
        //     </TouchableOpacity>
        // ),
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
        // headerLeft: () => (
        //   <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())          } activeOpacity={0.7} >
        //     <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
        //     </TouchableOpacity>
        // ),
      }} />

<Drawer.Screen name="PointCarWashDrawer" component={MakingOrderScreen} options={{
// <Drawer.Screen name="PointCarWash" component={PointCarWash} options={{
        headerShown: false,
        // headerStyle: {
        //   backgroundColor: '#6E7476',
        // },
        // headerTitleStyle: {
        //   color: '#fff',
        //   textTransform: 'uppercase',
        // }
      }} />

<Drawer.Screen name="Successful" component={SuccessfulOrder} options={{
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

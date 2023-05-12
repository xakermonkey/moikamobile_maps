import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
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


const Drawer = createDrawerNavigator();

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
        
        // headerLeft: () => (
        //   <TouchableOpacity onPress={() => navigation.navigate('CarFilters')} activeOpacity={0.7} style={{marginLeft:'15%'}}>
        //     <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
        //     </TouchableOpacity>
        // ),
        // headerRight: () => (
        //   <TouchableOpacity onPress={() => navigation.navigate('CarFilters')} activeOpacity={0.7} style={{marginRight:'20%'}}>
        //     <FontAwesome name='filter' size={28} color={'#7CD0D7'} />
        //   </TouchableOpacity>
        // ),
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

<Drawer.Screen name="PointCarWash" component={PointCarWash} options={{
        // headerShown: false,
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

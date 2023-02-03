import React from 'react';
import CarWashes from '../components/CarWashes';
import CarFilters from '../components/CarFilters';
import PointCarWash from '../components/PointCarWash';

import MakingOrderScreen from '../components/MakingOrderScreen';

// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


// const Stack = createStackNavigator();
const Stack = createNativeStackNavigator();

function CatalogScreen({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CarWashes" component={CarWashes} initialParams={{ sorted: 0, filters: [] }} />
      <Stack.Screen name="PointCarWash" component={PointCarWash} options={{
        
      }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }} >
        <Stack.Screen name="CarFilters" component={CarFilters} options={{
          // headerShown: false,
          // contentStyle: { opacity: 1 },
        }} />
      </Stack.Group>
      {/* 
        <Stack.Group screenOptions={{ presentation: 'modal' }} >
          <Stack.Screen name="MakingOrder" component={MakingOrder} options={{
          headerShown: false,
          contentStyle:{opacity:1},
          }} />
          <Stack.Screen name="GeneralPriceList" component={GeneralPriceList} options={{
          headerShown: false,
          contentStyle:{opacity:1},
          }} />
        </Stack.Group> */}

      <Stack.Screen name="MakingOrderScreen" component={MakingOrderScreen} options={{
        presentation: 'modal',
        headerShown: false,
        // headerShown: false,
        // headerBackTitleVisible: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#6E7476',

        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          textTransform: 'uppercase',
          // fontWeight: 'bold',
          fontFamily: 'Raleway_700Bold',
        },
        // headerLeft: () => (
        //   <TouchableOpacity onPress={() => navigation.navigate('CarWashes')} activeOpacity={0.7}>
        //     <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
        //     </TouchableOpacity>
        // ),
        // headerRight: () => (
        //   <TouchableOpacity onPress={() => navigation.navigate('MakingOrder')} activeOpacity={0.7}>
        //     <Ionicons name='cart-outline' size={28} color={'#7CD0D7'} />
        //   </TouchableOpacity>
        // ),
      }} />


    </Stack.Navigator>
  );
}

export default CatalogScreen

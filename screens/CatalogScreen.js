import React from 'react';
import CarWashes from '../components/CarWashes';
import CarFilters from '../components/CarFilters';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function CatalogScreen({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CarWashes" component={CarWashes} initialParams={{ sorted: 0, filters: [] }} />
      <Stack.Screen name="CarFilters" component={CarFilters} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

export default CatalogScreen

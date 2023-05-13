import React from 'react';
import PersonalAccount from '../components/PersonalAccount';
import MyCars from '../components/MyCars';
import MyOrders from '../components/MyOrders';
import OrderDetails from '../components/OrderDetails';
import AddEditCar from '../components/AddEditCar';
import EvaluateService from '../components/EvaluateService';

// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// const Stack = createStackNavigator();
const Stack = createNativeStackNavigator();


function PersonalAccountScreen({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PersonalAccountScreen" component={PersonalAccount} />
      <Stack.Screen name="MyCars" component={MyCars} />
      <Stack.Screen name="MyOrders" component={MyOrders} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} options={{}} />
      <Stack.Group screenOptions={{ presentation: 'modal' }} >
        <Stack.Screen name="AddEditCar" component={AddEditCar} options={{}} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }} >
        <Stack.Screen name="EvaluateService" component={EvaluateService} options={{ headerShown: false }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default PersonalAccountScreen

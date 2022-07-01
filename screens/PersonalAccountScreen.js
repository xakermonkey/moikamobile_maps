import React from 'react';
import PersonalAccount from '../components/PersonalAccount';
import MyCars from '../components/MyCars';
import MyOrders from '../components/MyOrders';
import OrderDetails from '../components/OrderDetails';
import AddEditCar from '../components/AddEditCar';
import EvaluateService from '../components/EvaluateService';

import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();

function PersonalAccountScreen({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PersonalAccountScreen" component={PersonalAccount} />
      <Stack.Screen name="MyCars" component={MyCars} />
      <Stack.Screen name="MyOrders" component={MyOrders} />

      {/* <Stack.Screen name="MyCards" component={MyCards} options={{
        title: 'МОИ КАРТЫ',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#6E7476',
        },
        headerTitleStyle: {
          color: '#fff',
          textTransform: 'uppercase',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate('PersonalAccountScreen')} activeOpacity={0.7}>
            <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
            </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('AddEditCard')} activeOpacity={0.7}>
            <AntDesign name='pluscircleo' size={28} color={'#7CD0D7'} />
            </TouchableOpacity>
        ),
      }} /> */}

      <Stack.Screen name="OrderDetails" component={OrderDetails} options={{
        
      }} />
      {/* <Stack.Group screenOptions={{ presentation: 'modal' }} >
          <Stack.Screen name="AddEditCard" component={AddEditCard} options={{
          headerShown: false,
          }} />
        </Stack.Group> */}
      <Stack.Group screenOptions={{ presentation: 'modal' }} >
          <Stack.Screen name="AddEditCar" component={AddEditCar} options={{
          // headerShown: false,
          }} />
        </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }} >
          <Stack.Screen name="EvaluateService" component={EvaluateService} options={{
          headerShown: false,
          }} />
        </Stack.Group>
    </Stack.Navigator>
  );
}

export default PersonalAccountScreen

import React from 'react';
import GeneralPriceList from './GeneralPriceList';
import PriceListFor from './PriceListFor';
import SelectDate from './SelectDate';
import SelectCar from './SelectCar';
import SelectPaymentMethod from './SelectPaymentMethod';
import OrderСompletion from './OrderСompletion';

// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PointCarWash from './PointCarWash';
import { useRoute } from '@react-navigation/native';


// const Stack = createStackNavigator();
const Stack = createNativeStackNavigator();

function MakingOrderScreen({ navigation }) {
  const route = useRoute();
  return (
    <Stack.Navigator>

          {/* <Stack.Screen name="MakingOrder" component={MakingOrder} options={{
          headerShown: false,
          }} /> */}

          <Stack.Screen name="PointCarWash" component={PointCarWash} options={{
          // headerShown: false,
          }}
          initialParams={route.params} 
          />          

          <Stack.Screen name="MakingOrderModal" component={MakingOrderModal} options={{
    headerShown: false,
        presentation: 'modal',
          // headerShown: false,
          }} />          
      </Stack.Navigator>
  );
}
function MakingOrderModal({ navigation }) {
  return (
  <Stack.Navigator>
  <Stack.Screen name="GeneralPriceList" component={GeneralPriceList} options={{
    headerShown: false,
  // presentation: 'modal',
    }} />

    <Stack.Screen name="PriceListFor" component={PriceListFor} options={{
    headerShown: false,
    }} />

    <Stack.Screen name="SelectDate" component={SelectDate} options={{
    headerShown: false,
    }} />

    <Stack.Screen name="SelectCar" component={SelectCar} options={{
    headerShown: false,
    }} />
    {/* <Stack.Screen name="AddCarInMakingOrder" component={AddCarInMakingOrder} options={{
    headerShown: false,
    }} /> */}

    <Stack.Screen name="SelectPaymentMethod" component={SelectPaymentMethod} options={{
    headerShown: false,
    }} />

    <Stack.Screen name="OrderСompletion" component={OrderСompletion} options={{
    headerShown: false,
    }} />
      </Stack.Navigator>
  )
}

export default MakingOrderScreen

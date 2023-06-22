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
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from '../screens/PointCarWashDrawerContent';
import { useWindowDimensions } from 'react-native';
import RatingAndReviews from './RatingAndReviews';

const Drawer = createDrawerNavigator();

// const Stack = createStackNavigator();
const Stack = createNativeStackNavigator();

function MakingOrderScreen({ navigation }) {
  const route = useRoute();
  return (
    <Stack.Navigator>
      {/* <Stack.Screen name="PointCarWash" component={PointCarWash} options={{
      }}
        initialParams={route.params}
      /> */}
      <Stack.Screen name="PointCarWashDrawer" component={PointCarWashDrawer} options={{
        headerShown: false,
      }}
        initialParams={route.params}
      />
      {/* <Stack.Screen name="MakingOrderModal" component={MakingOrderModal} options={{
        headerShown: false,
        presentation: 'modal',
      }} /> */}
    </Stack.Navigator>
  );
}

function PointCarWashDrawer({ navigation }) {
  const route = useRoute();
  const dimensions = useWindowDimensions();

  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />} screenOptions={{
      drawerType: dimensions.width >= 768 ? 'permanent' : 'front',
      drawerPosition: 'right',
      drawerStyle: {
        backgroundColor: '#6E7476',
        width: '84%',
        height: '100%'
      },
      drawerActiveTintColor: '#fff',
      drawerInactiveTintColor: '#fff',

    }}>
      <Drawer.Screen name="PointCarWash" component={PointCarWash}
        initialParams={route.params}
        />
      <Drawer.Screen name="MakingOrderModal" component={MakingOrderModal} options={{
        swipeEnabled: false,
        headerShown: false,
      }} />
      <Drawer.Screen name="RatingAndReviews" component={RatingAndReviews} options={{
      }} />
      
    </Drawer.Navigator>
  );
}

function MakingOrderModal({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GeneralPriceList" component={GeneralPriceList} options={{
        headerShown: false,
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

import { View, Image, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Alert, StatusBar as RNStatusBar, ActivityIndicator, Text } from 'react-native';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { YaMap, Animation, Marker, Polyline, ClusteredYamap } from 'react-native-yamap';
import { Dimensions } from 'react-native'
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_mobile, domain_web } from '../domain';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import * as TaskManager from "expo-task-manager";
import { CommonActions } from '@react-navigation/native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    // console.log(data);
    if (error) {
      console.log("error occurred");
    }
    if (data) {
      console.log("data-----", data);
    }
  }
);

function MapScreen({ navigation, route }) {

  const [washes, setWashes] = useState({});
  const [routes, setRoute] = useState([]);
  const [washeses, setWasheses] = useState([]);
  const [showWasheses, setShowWasheses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setDrawer] = useState(false);
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const [city, setCity] = useState(null);
  const responseListener = useRef();


  YaMap.init('b5f1cf2d-be55-4198-9e5d-66f0be967a30');
  YaMap.setLocale('ru_RU');

  map = React.createRef()

  const getOrderWashes = async () => {
    const phone = await AsyncStorage.getItem("phone"); // получение телефона из хранилища
    const res = await axios.get(domain_web + "/get_address_moika", { params: { phone: phone } }); // запрос на получение адреса мойки ближайшего заказа
    setWashes(res.data); // сохранеине адреса в State
  }


  const getCity = async () => {
    let loc = await AsyncStorage.getItem("location");
    if (loc == null) {
      loc = "Краснодар";
    }
    setCity(loc);
    return loc;
  }


  const getWasheses = async (loc) => {
    let phone = await AsyncStorage.getItem("phone");
    const ret = await axios.get(domain_web + "/get_all_washes", { params: { location: loc, phone: phone } })
    setWasheses(ret.data);
    setTimeout(() => setLoading(false), 1000);
  }



  const initMap = async () => {
    if (isOpen === true) {
      setDrawer(false)
    }
    if (map.current) {
      // let { status } = await Location.requestForegroundPermissionsAsync(); // запрос прав на определение геопозиции
      // const loc = await Location.getLastKnownPositionAsync(); // получение последних известных координат
      // setBLocation(status === 'granted')
      // if (status !== 'granted') {
      // Alert.alert("Ошибка", "Необходимо включить определение геопозиции");
      // }
      // if (loc == null) { // если нет прав или не получилось получить координаты
      // return;
      // }
      // console.log(route.params)
      if (route.params?.loc) {
        map.current.setCenter({ lon: route.params.loc.point.lon, lat: route.params.loc.point.lat }, route.params.loc.zoom, 0, 0, 1, Animation.SMOOTH); //координаты, зум, поворотом по азимуту и наклоном карты, длительность анимации, анимация
      }
      // } else {
      // console.log("initMap")
      // map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 16, 0, 0, 1, Animation.SMOOTH); //координаты, зум, поворотом по азимуту и наклоном карты, длительность анимации, анимация
      // }
    }
  }

  useLayoutEffect(() => {
    (async () => {
      // initMap();
    })();
  }, [])

  useFocusEffect(useCallback(() => { // функция при попадании экрана в фокус
    (async () => {
      if (Platform.OS == 'android') {
        initMap();
      }
      const loc = await getCity();
      console.log(loc, city);
      if (city !== loc) {
        getOrderWashes();
        setLoading(true);
        getWasheses(loc);
      }
    })()
  }, [route]));

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // console.log(notification);
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // console.log(response);
      if (Platform.OS == "ios") {
        if (response.notification.request.content.categoryIdentifier == "successful") {
          navigation.navigate("PersonalAccount");
          navigation.navigate("MyOrders");
          navigation.navigate('OrderDetails', { orderId: response.notification.request.trigger.payload.order });
          navigation.navigate('EvaluateService', { orderId: response.notification.request.trigger.payload.order });
          return;
        }
        else if (response.notification.request.content.categoryIdentifier == "new_stock") {
          navigation.navigate("Catalog");
          return;
        }
      }
      else if (Platform.OS == "android") {
        if (response.notification.request.trigger.remoteMessage.notification.tag == "successful") {
          navigation.navigate("PersonalAccount");
          navigation.navigate("MyOrders");
          navigation.navigate('OrderDetails', { orderId: response.notification.request.trigger.remoteMessage.data.order });
          navigation.navigate('EvaluateService', { orderId: response.notification.request.trigger.remoteMessage.data.order });
          return;
        }
        else if (response.notification.request.trigger.remoteMessage.notification.tag == "new_stock") {
          navigation.navigate("Catalog");
          return;
        }
      }

    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    // const pushtoken = await AsyncStorage.getItem("pushToken");
    if (Device.isDevice) {
      const devicePushToken = (await Notifications.getDevicePushTokenAsync()).data
      // console.log(devicePushToken);
      // if (pushtoken == null) {
      try {
        const token = await AsyncStorage.getItem("token");
        const device = Platform.OS == "ios";
        if (token != null) {
          await axios.post(domain_mobile + "/api/set_push_token", { token: devicePushToken, device: device }, { headers: { "Authorization": "Token " + token } });
        } else {
          await axios.post(domain_mobile + "/api/set_push_token", { token: devicePushToken, device: device });
        }
        await AsyncStorage.setItem("pushToken", devicePushToken);
      } catch (err) {
        console.log(err);
      }

      // }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      return devicePushToken;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

  }

  getCurrentPosition = () => {
    return new Promise((resolve) => {
      if (map.current) {
        map.current.getCameraPosition((position) => {
          resolve(position);
        });
      }
    });
  }
  const getVisibleRegion = () => {
    return new Promise((resolve) => {
      if (map.current) {
        map.current.getVisibleRegion((region) => {
          resolve(region);
        });
      }
    });
  }
  zoomUp = async () => { // приближение
    const position = await getCurrentPosition();
    // console.log(position);
    if (map.current) {
      // console.warn(map.current.props['children'][1]);
      map.current.setZoom(position.zoom * 1.1, 0.5);
    }
  };
  zoomDown = async () => { // отдаление
    const position = await getCurrentPosition();
    if (map.current) {
      map.current.setZoom(position.zoom * 0.9, 0.5); // зум, скорост анимации
    }
  };
  zoomToMe = async () => { // приближение к себе
    if (map.current) {
      const loc = await Location.getLastKnownPositionAsync();
      map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 15, 0, 0, 1, Animation.SMOOTH); //координаты, зум, поворотом по азимуту и наклоном карты, длительность анимации, анимация
    }
  };



  findRoute = async () => { // поиск пути
    if (Object.keys(washes).length != 0) { // если есть адрес автомойки в которой открыт заказ
      console.log(washes)

      if (map.current) {
        let { status } = await Location.getForegroundPermissionsAsync(); // проверка на наличие прав
        const loc = await Location.getCurrentPositionAsync(); // получение ТОЧНОЙ позиции
        if (Object.keys(washes).length != 0) { // если есть адрес автомойки в которой открыт заказ
          console.log(washes)

          if (status !== 'granted' || loc == null) { // если нет прав иил не получена геопозиция
            Alert.alert("Ошибка", "Для построения маршрута необходимо включить определение геопозиции");
            return;
          }
          console.warn({ lon: loc.coords.longitude, lat: loc.coords.latitude });
          Alert.alert("Приятной дороги", "Идет поиск самого короткого маршрута");
          map.current.findDrivingRoutes([{ lon: loc.coords.longitude, lat: loc.coords.latitude }, { lon: parseFloat(washes.lon), lat: parseFloat(washes.lat) }], (event) => {
            // console.log(event.routes[0])
            if (event.routes.length == 0) {

              map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 12, 0, 0, 1, Animation.SMOOTH);
              return;
            }
            const len = event.routes[0].sections.length
            let arr = new Array();
            for (let i = 0; i < len; i++) {
              arr = [...arr, ...event.routes[0].sections[i].points];
            }
            console.log(arr);
            setRoute(arr);
          })
        } else {
          if (status !== 'granted' || loc == null) {
            Alert.alert("Ошибка", "Необходимо включить определение геопозиции");
            return;
          }
          map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 12, 0, 0, 1, Animation.SMOOTH);
        }

      }
    } else {
      Alert.alert("Внимание", "Чтобы построить маршрут, необходимо оформить заказ");
      return;
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar />
      {loading &&
        <View style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%', height: '100%', zIndex: 1 }} >
          <ActivityIndicator color='black' size={'large'} />
          <Text>Идет загрузка карты</Text>
        </View>}
        {routes != [] ?
      <YaMap
        ref={map}
        style={styles.container}>
        {/* <Polyline strokeWidth={7} strokeColor="#7CD0FF" points={[{ "lat": 60.001058999007924, "lon": 30.25570100808355 }, { "lat": 60.00105900000001, "lon": 30.255701 }, { "lat": 60.001194, "lon": 30.255771 }, { "lat": 60.001395, "lon": 30.255874 }, { "lat": 60.002194, "lon": 30.256286 }, { "lat": 60.003408, "lon": 30.256914 }, { "lat": 60.003986, "lon": 30.257213 }, { "lat": 60.004673, "lon": 30.257568 }, { "lat": 60.00485, "lon": 30.257658 }, { "lat": 60.005539, "lon": 30.258014 }, { "lat": 60.006, "lon": 30.258248 }, { "lat": 60.006272, "lon": 30.258392 }, { "lat": 60.006666, "lon": 30.258589 }, { "lat": 60.00671, "lon": 30.258621 }, { "lat": 60.006752, "lon": 30.258675 }, { "lat": 60.0068, "lon": 30.258752 }, { "lat": 60.006834, "lon": 30.258842 }, { "lat": 60.006856, "lon": 30.25893 }, { "lat": 60.006869, "lon": 30.259002 }, { "lat": 60.006879, "lon": 30.259086 }, { "lat": 60.006884, "lon": 30.259197 }, { "lat": 60.006879, "lon": 30.259339 }, { "lat": 60.006881, "lon": 30.25946 }, { "lat": 60.006891, "lon": 30.259542 }, { "lat": 60.006901, "lon": 30.259617 }, { "lat": 60.00695700154974, "lon": 30.25986100675243 }, { "lat": 60.006957000000014, "lon": 30.259861000000004 }, { "lat": 60.00703, "lon": 30.26007 }, { "lat": 60.007102, "lon": 30.260287 }, { "lat": 60.007168, "lon": 30.260477 }, { "lat": 60.007245, "lon": 30.260708 }, { "lat": 60.007384, "lon": 30.26108 }, { "lat": 60.007431, "lon": 30.26116 }, { "lat": 60.007462, "lon": 30.261199 }, { "lat": 60.007488, "lon": 30.261223 }, { "lat": 60.00754, "lon": 30.261232 }, { "lat": 60.007615, "lon": 30.261225 }, { "lat": 60.007735, "lon": 30.261199 }, { "lat": 60.00781, "lon": 30.261151 }, { "lat": 60.007844, "lon": 30.261104 }, { "lat": 60.007873, "lon": 30.261052 }, { "lat": 60.007897, "lon": 30.260983 }, { "lat": 60.007914, "lon": 30.260918 }, { "lat": 60.007937, "lon": 30.260811 }, { "lat": 60.007961, "lon": 30.260679 }, { "lat": 60.007973, "lon": 30.260582 }, { "lat": 60.008039, "lon": 30.260079 }, { "lat": 60.00807600095363, "lon": 30.259790992577244 }, { "lat": 60.00807600000001, "lon": 30.259791 }, { "lat": 60.008094, "lon": 30.259489 }, { "lat": 60.008094, "lon": 30.259364 }, { "lat": 60.008082, "lon": 30.259253 }, { "lat": 60.008067, "lon": 30.259182 }, { "lat": 60.008046, "lon": 30.259113 }, { "lat": 60.008016, "lon": 30.259048 }, { "lat": 60.007973, "lon": 30.25897 }, { "lat": 60.007926, "lon": 30.258907 }]} /> */}
        {routes != [] && <Polyline strokeWidth={7} strokeColor="#7CD0FF" points={routes} />}
      </YaMap> :
      <ClusteredYamap
        ref={map}
        style={styles.container}
        clusterColor="blue"
        clusteredMarkers={
          washeses.map(obj => {
            return ({
              point: {
                lat: parseFloat(obj.lat),
                lon: parseFloat(obj.lon),
              },
              data: {
                avatar: obj.avatar,
                id: obj.id,
                sale: obj.sale,
              }
            })
          })
        }
        renderMarker={(obj, index) => (Platform.OS === "android" ?
          <Marker scale={0.3} key={index} point={obj.point}
            onPress={() => {
              (async () => {
                await AsyncStorage.setItem("washer", obj.data.id.toString());
                await AsyncStorage.setItem("sale", obj.data.sale.toString());
                navigation.navigate('PointCarWashDrawer', { from: "map", loc: await getCurrentPosition() });
                // navigation.navigate('PointCarWashDrawer', { from: "map" });
              })();
            }}
          ><Image source={require('../assets/images/location.png')} style={{ width: 60, resizeMode: 'contain' }} /></Marker>
          :
          <Marker scale={0.3} key={index} point={obj.point}
            source={require('../assets/images/location.png')}
            onPress={() => {
              (async () => {
                await AsyncStorage.setItem("washer", obj.data.id.toString());
                await AsyncStorage.setItem("sale", obj.data.sale.toString());
                navigation.navigate('PointCarWashDrawer', { from: "map", loc: await getCurrentPosition() });
              })();
            }}
          />
        )}
      >
      </ClusteredYamap>}

      <View style={{
        position: 'absolute',
        top: Dimensions.get('window').height * 0.1,
        left: Dimensions.get('window').width * 0.05
      }}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => { navigation.dispatch(DrawerActions.openDrawer()); }} style={{}} >
          <Image source={require('../assets/images/map_main.png')} style={styles.bg_img} />
        </TouchableOpacity>
      </View>
      <View style={{
        position: 'absolute',
        top: Dimensions.get('window').height * 0.1,
        right: Dimensions.get('window').width * 0.05
      }}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('AnsQues')} style={{}} >
          <Image source={require('../assets/images/map_faq.png')} />
        </TouchableOpacity>
      </View>

      <View style={{
        position: 'absolute',
        bottom: Dimensions.get('window').height * 0.1,
        left: Dimensions.get('window').width * 0.05
      }}>
        <TouchableOpacity activeOpacity={0.9} onPress={zoomUp} style={{}} >
          <Image source={require('../assets/images/map_plus.png')} resizeMode='stretch' style={{ width: 60, height: 60 }} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} onPress={zoomDown} style={{}} >
          <Image source={require('../assets/images/map_minus.png')} resizeMode='stretch' style={{ width: 60, height: 60 }} />
        </TouchableOpacity>
      </View>

      <View style={{
        position: 'absolute',
        bottom: Dimensions.get('window').height * 0.1,
        right: Dimensions.get('window').width * 0.05
      }}>
        <View style={{ bottom: 20 }}>
          <TouchableOpacity activeOpacity={0.8} onPress={findRoute} style={{}} >
            <Image source={require('../assets/images/map_route.png')} style={styles.bg_img} />
          </TouchableOpacity>
        </View>
        <View style={{ width: 60 }}>
          <TouchableOpacity activeOpacity={0.8} onPress={zoomToMe} style={{}} >
            <Image source={require('../assets/images/map_navigation.png')} style={styles.bg_img} />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

export default MapScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

})
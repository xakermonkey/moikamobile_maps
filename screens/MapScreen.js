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

function MapScreen({ navigation }) {

  const [washes, setWashes] = useState({});
  const [route, setRoute] = useState([]);
  const [washeses, setWasheses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setDrawer] = useState(false);
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();


  YaMap.init('b5f1cf2d-be55-4198-9e5d-66f0be967a30');
  YaMap.setLocale('ru_RU');

  map = React.createRef()

  useFocusEffect(useCallback(() => { // функция при попадании экрана в фокус
    (async () => {
      if (isOpen === true) {
        setDrawer(false)
      }
      if (map.current) {
        let { status } = await Location.requestForegroundPermissionsAsync(); // запрос прав на определение геопозиции
        const loc = await Location.getCurrentPositionAsync(); // получение последних известных координат
        // setBLocation(status === 'granted')
        if (status !== 'granted') {
          Alert.alert("Ошибка", "Необходимо включить определение геопозиции");
        }
        const phone = await AsyncStorage.getItem("phone"); // получение телефона из хранилища
        const res = await axios.get(domain_web + "/get_address_moika", { params: { phone: phone } }); // запрос на получение адреса мойки ближайшего заказа
        setWashes(res.data); // сохранеине адреса в State
        if (loc == null) { // если нет прав или не получилось получить координаты
          return;
        }

        // console.warn(loc.coords.latitude);
        map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 15, 0, 0, 1, Animation.SMOOTH); //координаты, зум, поворотом по азимуту и наклоном карты, длительность анимации, анимация
      }

    })();
    setLoading(true);
    AsyncStorage.getItem("location").then(loc => {
      if (loc == null) {
        loc = "Краснодар";
      }
      AsyncStorage.getItem("phone").then(phone => {
        axios.get(domain_web + "/get_all_washes", { params: { location: loc, phone: phone } })
          .then(ret => {
            setWasheses(ret.data);
            setLoading(false);
            // сохранение всех моек в State // запрос всех моек в городе
          })
      })
    })
  }, []));

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
  zoomToMarker = async () => { // приближение к себе
    if (map.current) {
      const loc = await Location.getLastKnownPositionAsync();
      map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 15, 0, 0, 1, Animation.SMOOTH); //координаты, зум, поворотом по азимуту и наклоном карты, длительность анимации, анимация
    }
  };



  findRoute = async () => { // поиск пути
    if (Object.keys(washes).length != 0) { // если есть адрес автомойки в которой открыт заказ
      // console.log(washes)

      if (map.current) {
        let { status } = await Location.getForegroundPermissionsAsync(); // проверка на наличие прав
        const loc = await Location.getCurrentPositionAsync(); // получение ТОЧНОЙ позиции
        if (Object.keys(washes).length != 0) { // если есть адрес автомойки в которой открыт заказ
          // console.log(washes)

          if (status !== 'granted' || loc == null) { // если нет прав иил не получена геопозиция
            Alert.alert("Ошибка", "Для построения маршрута необходимо включить определение геопозиции");
            return;
          }
          // console.warn({ lon: loc.coords.longitude, lat: loc.coords.latitude });
          Alert.alert("Приятной дороги", "Идет поиск самого короткого маршрута");
          map.current.findDrivingRoutes([{ lon: loc.coords.longitude, lat: loc.coords.latitude }, { lon: parseFloat(washes.lon), lat: parseFloat(washes.lat) }], (event) => {
            if (event.routes.length == 0) {
              // console.warn(event.routes[0])
              map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 12, 0, 0, 1, Animation.SMOOTH);
              return;
            }
            const len = event.routes[0].sections.length
            let arr = new Array();
            for (let i = 0; i < len; i++) {
              arr = [...arr, ...event.routes[0].sections[i].points];
            }
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

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
  //       <ActivityIndicator color='black' size={'large'} />
  //     </View>
  //   )
  // }

  //ПЕРЕСМОТРЕТЬ КАРТУУУУ!!!!!
  // YaMap.resetLocale(); // язык системы
  return (
    <View style={styles.container}>
      <StatusBar />
      {loading &&
        <View style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%', height: '100%', zIndex: 1 }} >
          <ActivityIndicator color='black' size={'large'} />
          <Text>Идет загрузка карты</Text>
        </View>}
      <ClusteredYamap
        ref={map}
        // userLocationIcon={{ uri: 'https://www.clipartmax.com/png/middle/180-1801760_pin-png.png' }}
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
        renderMarker={(info, index) => (
          <Marker scale={0.6} key={index} point={info.point}
            source={require('../assets/images/location.png')} // {{ uri: domain_web + obj.avatar }}
            onPress={() => {
              (async () => {
                await AsyncStorage.setItem("washer", info.data.id.toString());
                await AsyncStorage.setItem("sale", info.data.sale.toString());
                navigation.navigate('Catalog');
                navigation.navigate('PointCarWash');
              })();
            }}
          />
        )}
      >
        {route != [] && <Polyline strokeWidth={7} strokeColor="#7CD0FF" points={route} />}
      </ClusteredYamap>

      {/* Dimensions.get('window').width */}
      {!isOpen &&
        <SafeAreaView style={{ position: 'absolute', paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0 }}>
          <View style={{ width: 1, height: Platform.OS === 'ios' ? Dimensions.get('window').height - 100 : Dimensions.get('window').height - 20, justifyContent: 'space-between' }}>
            <View style={{ height: 1, flexDirection: 'row', justifyContent: 'space-between', width: Dimensions.get('window').width, paddingVertical: 30, paddingHorizontal: 20 }}>
              <View style={{ width: 60 }}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => { navigation.dispatch(DrawerActions.openDrawer()); }} style={{}} >
                  <Image source={require('../assets/images/map_main.png')} style={styles.bg_img} />
                </TouchableOpacity>
              </View>
              <View style={{ width: 60 }}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('AnsQues')} style={{}} >
                  <Image source={require('../assets/images/map_faq.png')} style={styles.bg_img} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: Dimensions.get('window').width, bottom: 0, padding: 20 }}>
              <View style={{}}>
                <View style={{ width: 60 }}>
                  <TouchableOpacity activeOpacity={0.9} onPress={zoomUp} style={{}} >
                    <Image source={require('../assets/images/map_plus.png')} resizeMode='stretch' style={{ width: 60, height: 60 }} />
                  </TouchableOpacity>
                </View>
                <View style={{ width: 60 }}>
                  <TouchableOpacity activeOpacity={0.9} onPress={zoomDown} style={{}} >
                    <Image source={require('../assets/images/map_minus.png')} resizeMode='stretch' style={{ width: 60, height: 60 }} />
                  </TouchableOpacity>
                </View>
              </View>


              <View style={{}}>
                <View style={{ width: 60, bottom: 20 }}>
                  <TouchableOpacity activeOpacity={0.8} onPress={findRoute} style={{}} >
                    <Image source={require('../assets/images/map_route.png')} style={styles.bg_img} />
                  </TouchableOpacity>
                </View>
                <View style={{ width: 60 }}>
                  <TouchableOpacity activeOpacity={0.8} onPress={zoomToMarker} style={{}} >
                    <Image source={require('../assets/images/map_navigation.png')} style={styles.bg_img} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>}
    </View>
  );
}

export default MapScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  img: {
    // height: '100%',
    // width: '100%'
  },
  map_btn: {
    // position: 'absolute', zIndex: 1,
    // width: '100%', height: '100%',
    // justifyContent: 'space-between'
  },
  row: {
    // flexDirection: 'row', justifyContent: 'space-between',
    // width: '100%',
    // padding: '5%',
  },
})
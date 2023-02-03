import { View, Image, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Alert, StatusBar } from 'react-native';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { YaMap, Animation, Marker, Polyline } from 'react-native-yamap';
import { Dimensions } from 'react-native'
// import Geolocation from 'react-native-geolocation-service';
// import Geolocation from '@react-native-community/geolocation';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_web } from '../domain';
// import { StatusBar } from 'expo-status-bar';

import { Notifications } from 'react-native-notifications';


function MapScreen({ navigation }) {

  
  
  const [washes, setWashes] = useState({});
  const [route, setRoute] = useState([]);
  const [washeses, setWasheses] = useState([]);
  // const [bLocation, setBLocation] = useState(false);
  const [isOpen, setDrawer] = useState(false);

  YaMap.init('b5f1cf2d-be55-4198-9e5d-66f0be967a30');
  YaMap.setLocale('ru_RU');

  map = React.createRef()

  useLayoutEffect(() => {
    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      console.log(`Notification received in foreground: ${notification.title} : ${notification.body}`);
      completion({ alert: true, sound: false, badge: true });
    });
  
    Notifications.events().registerNotificationOpened((notification, completion) => {
      console.log(`Notification opened: ${notification.payload}`);
      completion();
      if (notification.payload.category == "stock"){
        console.log("Stock");
        navigation.navigate('Catalog');
        
      }else if (notification.payload.category == "order"){
        console.log("Order");
      }
    });
  
    Notifications.events().registerRemoteNotificationsRegistered((event) => {
      // TODO: отправить токен на мой сервер, чтобы он мог отправлять обратно push-уведомления...
      console.log("Device Token Received", event.deviceToken);
    });
    Notifications.events().registerRemoteNotificationsRegistrationFailed((event) => {
      console.error(event);
    });
  }, [])

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
        let location = await AsyncStorage.getItem("location"); // получение города из хранилища
        if (location == null) {
          location = "Краснодар";
        }
        const ret = await axios.get(domain_web + "/get_all_washes", { params: { location: location, phone: phone } }); // запрос всех моек в городе
        setWasheses(ret.data); // сохранение всех моек в State
        const res = await axios.get(domain_web + "/get_address_moika", { params: { phone: phone } }); // запрос на получение адреса мойки ближайшего заказа
        setWashes(res.data); // сохранеине адреса в State
        
        if (loc == null) { // если нет прав или не получилось получить координаты
          return;
        }
        // console.warn(loc.coords.latitude);
        map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 15, 0, 0, 1, Animation.SMOOTH); //координаты, зум, поворотом по азимуту и наклоном карты, длительность анимации, анимация
      }
      
    })();
  }, []));

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
    // Notifications.postLocalNotification({
    //   body: "Local Notification",
    //   title: "Title local"
    // });
    const position = await getCurrentPosition();
    if (map.current) {
      // console.warn(Object.keys(map.current.props));
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
  //ПЕРЕСМОТРЕТЬ КАРТУУУУ!!!!!
  // YaMap.resetLocale(); // язык системы
  return (
    <View style={styles.container}>
      {/* <StatusBar style='auto' /> */}
      <YaMap
        ref={map}
        // userLocationIcon={{ uri: 'https://www.clipartmax.com/png/middle/180-1801760_pin-png.png' }}
        style={styles.container}
      >
        {washeses.map(obj => <Marker scale={0.05} key={obj.id} point={{ lat: parseFloat(obj.lat), lon: parseFloat(obj.lon) }}
          source={{ uri: domain_web + obj.avatar }}
          onPress={() => {
            (async () => {
              await AsyncStorage.setItem("washer", obj.id.toString());
              await AsyncStorage.setItem("sale", obj.sale.toString());
              navigation.navigate('Catalog')
              navigation.navigate('PointCarWash')
            })();
          }}
        />)}
        {route != [] && <Polyline strokeWidth={7} strokeColor="#7CD0FF" points={route} />}
      </YaMap>

      {/* Dimensions.get('window').width */}
      {!isOpen &&
        <SafeAreaView style={{ position: 'absolute', paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
          <View style={{ width: 1, height: Platform.OS === 'ios' ? Dimensions.get('window').height - 100 : Dimensions.get('window').height - 20, justifyContent: 'space-between' }}>
            <View style={{ height: 1, flexDirection: 'row', justifyContent: 'space-between', width: Dimensions.get('window').width, paddingVertical: 30, paddingHorizontal: 20 }}>
              <View style={{ width: 60 }}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => { setDrawer(true); navigation.dispatch(DrawerActions.openDrawer()); setDrawer(false); }} style={{}} >
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
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
import { CommonActions } from '@react-navigation/native';

function MapScreen({ navigation, route }) {

  const [washes, setWashes] = useState({});
  const [routes, setRoute] = useState([]);
  const [washeses, setWasheses] = useState([]);
  const [showWasheses, setShowWasheses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setDrawer] = useState(false);
  // const [notification, setNotification] = useState(false);
  const [city, setCity] = useState(null);
  const responseListener = useRef();
  const [disable, setDisable] = useState(false);

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
      let { status } = await Location.requestForegroundPermissionsAsync(); // запрос прав на определение геопозиции
      const loc = await Location.getLastKnownPositionAsync(); // получение последних известных координат
      // setBLocation(status === 'granted')
      if (status !== 'granted') {
        Alert.alert("Ошибка", "Необходимо включить определение геопозиции");
      }
      // console.log(route.params)
      // if (route.params?.loc) {ф
      //   
      // }
      // } else {
      console.log("initMap")
      if (loc != null) {
        map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 16, 0, 0, 1, Animation.SMOOTH); //координаты, зум, поворотом по азимуту и наклоном карты, длительность анимации, анимация
      }
      // }
    }
  }

  const createRoute = async () => {
    setDisable(true);
    if (route.params?.washes != undefined) { // если есть адрес автомойки в которой открыт заказ


      if (map.current) {
        let { status } = await Location.getForegroundPermissionsAsync(); // проверка на наличие прав
        if (status !== 'granted') { // если нет прав иил не получена геопозиция
          Alert.alert("Ошибка", "Для построения маршрута необходимо включить определение геопозиции");
          setDisable(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync(); // получение ТОЧНОЙ позиции
        Alert.alert("Приятной дороги", "Идет поиск самого короткого маршрута");
        map.current.findDrivingRoutes([{ lon: loc.coords.longitude, lat: loc.coords.latitude }, { lon: parseFloat(route.params.washes.lon), lat: parseFloat(route.params.washes.lat) }], (event) => {
          if (event.routes.length == 0) {
            map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 12, 0, 0, 1, Animation.SMOOTH);
            return;
          }
          const len = event.routes[0].sections.length
          let arr = new Array();
          for (let i = 0; i < len; i++) {
            arr = [...arr, ...event.routes[0].sections[i].points];
          }
          setRoute(arr);
          setDisable(false);
        })
      }
    }
    setDisable(false);
  }

  useLayoutEffect(() => {
    (async () => {
      initMap();
      const loc = await getCity();
      getOrderWashes();
      setLoading(true);
      getWasheses(loc);
      createRoute();
    })();
  }, [])

  // useFocusEffect(useCallback(() => { // функция при попадании экрана в фокус
  //   (async () => {
  //     // if (Platform.OS == 'android') {
  //     //   initMap();
  //     // }
  //     const loc = await getCity();
  //     console.log(loc, city);
  //     if (city !== loc) {
  //       getOrderWashes();
  //       setLoading(true);
  //       getWasheses(loc);
  //     }
  //   })()
  // }, [route]));

  useEffect(() => {
    registerForPushNotificationsAsync();

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('response');
      console.log(response.notification.request.content.data.category);
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
        // if (response.notification.request.trigger.remoteMessage.notification.tag == "successful") {
        if (response.notification.request.content.data.category == "successful") {
          navigation.navigate("PersonalAccount");
          navigation.navigate("MyOrders");
          // navigation.navigate('OrderDetails', { orderId: response.notification.request.trigger.remoteMessage.data.order });
          // navigation.navigate('EvaluateService', { orderId: response.notification.request.trigger.remoteMessage.data.order });
          navigation.navigate('OrderDetails', { orderId: response.notification.request.content.data.order });
          navigation.navigate('EvaluateService', { orderId: response.notification.request.content.data.order });
          return;
        }
        // else if (response.notification.request.trigger.remoteMessage.notification.tag == "new_stock") {
        else if (response.notification.request.content.data.category == "new_stock") {
          navigation.navigate("Catalog");
          return;
        }
      }

    });

    // return () => {
    //   Notifications.removeNotificationSubscription(notificationListener.current);
    //   Notifications.removeNotificationSubscription(responseListener.current);
    // };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    // const pushtoken = await AsyncStorage.getItem("pushToken");
    if (Device.isDevice) {
      const devicePushToken = (await Notifications.getDevicePushTokenAsync()).data
      console.log(devicePushToken);
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

    // if (Platform.OS === 'android') {
    //   await Notifications.setNotificationChannelAsync('miscellaneous', {
    //     name: 'Miscellaneous',
    //     sound: true,
    //     importance: Notifications.AndroidImportance.MAX,
    //     vibrationPattern: [0, 250, 250, 250],
    //     lightColor: '#FF231F7C',
    //   });
    // }

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
    setDisable(true);
    if (Object.keys(washes).length != 0) { // если есть адрес автомойки в которой открыт заказ
      console.log(washes)

      if (map.current) {
        let { status } = await Location.getForegroundPermissionsAsync(); // проверка на наличие прав
        const loc = await Location.getCurrentPositionAsync(); // получение ТОЧНОЙ позиции
        if (Object.keys(washes).length != 0) { // если есть адрес автомойки в которой открыт заказ
          console.log(washes)

          if (status !== 'granted' || loc == null) { // если нет прав иил не получена геопозиция
            Alert.alert("Ошибка", "Для построения маршрута необходимо включить определение геопозиции");
            setDisable(false);
            return;
          }
          console.warn({ lon: loc.coords.longitude, lat: loc.coords.latitude });
          Alert.alert("Маршрут построен", "Приятной дороги"); // Приятной дороги // Идет поиск самого короткого маршрута
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
            setDisable(false);
          })
        } else {
          if (status !== 'granted' || loc == null) {
            Alert.alert("Ошибка", "Необходимо включить определение геопозиции");
            setDisable(false);
            return;
          }
          map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 12, 0, 0, 1, Animation.SMOOTH);
        }

      }
    } else {
      Alert.alert("Внимание", "Чтобы построить маршрут, необходимо оформить заказ");
      setDisable(false);
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
      <YaMap
        ref={map}
        style={styles.container}>
        {/* <Marker scale={0.3} point={{lat:59.925511, lon:30.319755,}}>
          <Image source={require('../assets/images/location.png')} style={{ width: 60, resizeMode: 'contain' }} />
          </Marker> */}
        {washeses.map((obj, index) => (Platform.OS === "android" ?
          <Marker scale={0.3} key={index} point={{
            lat: parseFloat(obj.lat),
            lon: parseFloat(obj.lon),
          }}
            onPress={() => {
              (async () => {
                await AsyncStorage.setItem("washer", obj.id.toString());
                await AsyncStorage.setItem("sale", obj.sale.toString());
                navigation.navigate('MakingOrder', { from: "map", loc: await getCurrentPosition() });
                // navigation.navigate('MakingOrder', { from: "map" });
              })();
            }}
          ><Image source={require('../assets/images/location.png')} style={{ width: 60, resizeMode: 'contain' }} /></Marker>
          :
          <Marker scale={0.3} key={index} point={{
            lat: parseFloat(obj.lat),
            lon: parseFloat(obj.lon),
          }}
            source={require('../assets/images/location.png')}
            onPress={() => {
              (async () => {
                await AsyncStorage.setItem("washer", obj.id.toString());
                await AsyncStorage.setItem("sale", obj.sale.toString());
                navigation.navigate('MakingOrder', { from: "map", loc: await getCurrentPosition() });
              })();
            }}
          />
        ))}
        {routes != [] && <Polyline strokeWidth={7} strokeColor="#7CD0FF" points={routes} />}
      </YaMap>
      {/* <ClusteredYamap
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
                navigation.navigate('MakingOrder', { from: "map", loc: await getCurrentPosition() });
                // navigation.navigate('MakingOrder', { from: "map" });
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
                navigation.navigate('MakingOrder', { from: "map", loc: await getCurrentPosition() });
              })();
            }}
          />
        )}
      >
      </ClusteredYamap> */}

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
          <TouchableOpacity activeOpacity={0.8} onPress={findRoute} disabled={disable} style={{}} >
            <Image source={require('../assets/images/map_route.png')} style={styles.bg_img} />
            {disable &&
              <View style={{
                position: 'absolute', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%',
                backgroundColor: 'rgba(00, 00, 00, 0.7)',
                borderRadius: 5
              }}>
                <ActivityIndicator color="white" />
              </View>
            }
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
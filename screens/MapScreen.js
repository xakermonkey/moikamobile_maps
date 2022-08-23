import { View, Image, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { YaMap, Animation, Marker, Polyline } from 'react-native-yamap';
import { Dimensions } from 'react-native'
// import Geolocation from 'react-native-geolocation-service';
// import Geolocation from '@react-native-community/geolocation';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_web } from '../domain';
import { StatusBar } from 'expo-status-bar';


function MapScreen({ navigation }) {


  const [washes, setWashes] = useState(null);
  const [route, setRoute] = useState([]);
  const [washeses, setWasheses] = useState([]);
  // const [bLocation, setBLocation] = useState(false);
  const [isOpen, setDrawer] = useState(false);


  useLayoutEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      // setBLocation(status === 'granted')
      if (status !== 'granted') {
        Alert.alert("Ошибка", "Необходимо включить определение геопозиции");
      }

      const phone = await AsyncStorage.getItem("phone");
      const location = await AsyncStorage.getItem("location");
      const ret = await axios.get(domain_web + "/get_all_washes", { params: { location: location, phone: phone } });
      setWasheses(ret.data);
      const res = await axios.get(domain_web + "/get_address_moika", { params: { phone: phone } });
      setWashes(res.data);
    })();
  }, [navigation])

  YaMap.init('b5f1cf2d-be55-4198-9e5d-66f0be967a30');
  YaMap.setLocale('ru_RU');

  map = React.createRef()

  // let lat = ''
  // let lon = ''
  // const geolocation = (lat, lon) => {
  //   Geolocation.getCurrentPosition(info => {
  //     lat = info.coords.latitude
  //     lon = info.coords.longitude
  //     console.log(lat)
  //     console.log(lon)
  //   });
  // }

  useEffect(() => {
    (async () => {
      if (isOpen === true) {
        setDrawer(false)
      }
      if (map.current) {
        const loc = await Location.getLastKnownPositionAsync();
        // console.warn(loc.coords.latitude);
        map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 15, 0, 0, 1, Animation.SMOOTH); //координаты, зум, поворотом по азимуту и наклоном карты, длительность анимации, анимация
      }
    })();
  }, [map]);

  getCurrentPosition = () => {
    return new Promise((resolve) => {
      if (map.current) {
        map.current.getCameraPosition((position) => {
          resolve(position);
        });
      }
    });
  }
  zoomUp = async () => {
    const position = await getCurrentPosition();
    if (map.current) {
      // console.warn(Object.keys(map.current.props));
      map.current.setZoom(position.zoom * 1.1, 0.5);
    }
  };
  zoomDown = async () => {
    const position = await getCurrentPosition();
    if (map.current) {
      map.current.setZoom(position.zoom * 0.9, 0.5); // зум, скорост анимации
    }
  };
  zoomToMarker = async () => {
    if (map.current) {
      const loc = await Location.getLastKnownPositionAsync();
      map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 15, 0, 0, 1, Animation.SMOOTH); //координаты, зум, поворотом по азимуту и наклоном карты, длительность анимации, анимация
    }
  };

  findRoute = async () => {
    if (map.current) {
      if (washes == null) {
        const loc = await Location.getLastKnownPositionAsync();
        // console.warn({ lon: loc.coords.longitude, lat: loc.coords.latitude });
        map.current.findDrivingRoutes([{ lon: loc.coords.longitude, lat: loc.coords.latitude }, { lon: parseFloat(washes.lon), lat: parseFloat(washes.lat) }], (event) => {
          const len = event.nativeEvent.routes[0].sections.length
          let arr = new Array();
          for (let i = 0; i < len; i++) {
            arr = [...arr, ...event.nativeEvent.routes[0].sections[i].points];
          }
          setRoute(arr);
        })
      } else {
        const loc = await Location.getLastKnownPositionAsync();
        map.current.setCenter({ lon: loc.coords.longitude, lat: loc.coords.latitude }, 12, 0, 0, 1, Animation.SMOOTH);
      }

    }
  }

  // YaMap.resetLocale(); // язык системы
  return (
    <View style={styles.container}>
      <StatusBar style='auto' />
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
        <SafeAreaView style={{ position: 'absolute' }}>
          <View style={{ height: Platform.OS === 'ios' ? Dimensions.get('window').height-100 : Dimensions.get('window').height - 20, justifyContent:'space-between'}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: Dimensions.get('window').width, paddingVertical: 30, paddingHorizontal:20 }}>
              <View style={{ width: 60 }}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => { setDrawer(true); navigation.dispatch(DrawerActions.openDrawer()) }} style={{}} >
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
                <View style={{ width: 60, bottom:20 }}>
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
import { View, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { YaMap, Animation, } from 'react-native-yamap';
import { Dimensions } from 'react-native'
// import Geolocation from 'react-native-geolocation-service';
// import Geolocation from '@react-native-community/geolocation';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_web } from '../domain';


function MapScreen({ navigation }) {


  const [washes, setWashes] = useState(null);
  // state = initialState;


  useLayoutEffect(() => {
    (async () => {
      const phone = await AsyncStorage.getItem("phone");
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
      if (map.current) {
        const loc = await Location.getLastKnownPositionAsync();
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
    if (map.current){
      const loc = await Location.getLastKnownPositionAsync();
      map.current.findDrivingRoutes([{ lon: loc.coords.longitude, lat: loc.coords.latitude }, { lon: washes.lon, lat: washes.lat }], (event) => console.warn(event.nativeEvent))
    }
  }

  // YaMap.resetLocale(); // язык системы
  return (
    <View style={styles.container}>
      <YaMap
        ref={this.map}
        // userLocationIcon={{ uri: 'https://www.clipartmax.com/png/middle/180-1801760_pin-png.png' }}
        style={{ flex: 1 }}
      ></YaMap>

      <View style={{ width: 1, margin: 20, marginTop: 80, position: 'absolute' }}>
        <View style={{ width: 60 }}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{}} >
            <Image source={require('../assets/images/map_main.png')} style={styles.bg_img} />
          </TouchableOpacity>
        </View>
        <View style={{ width: 60, left: Dimensions.get('window').width - 100, bottom: 60 }}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('AnsQues')} style={{}} >
            <Image source={require('../assets/images/map_faq.png')} style={styles.bg_img} />
          </TouchableOpacity>
        </View>

        <View style={{ width: 1, top: Dimensions.get('window').height - 400 }}>
          <View style={{ width: 60, bottom: 0 }}>
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


        <View style={{ width: 1, left: Dimensions.get('window').width - 100, top: Dimensions.get('window').height - 520 }}>
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
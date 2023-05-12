import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, Dimensions, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { domain_web } from '../domain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { StatusBar } from 'expo-status-bar';
import FastImage from 'react-native-fast-image';
import { Skeleton } from 'react-native-skeleton-loaders'

function PointCarWash({ navigation, route }) {

  const [photo, setPhoto] = useState(null);
  const [filt, setFilt] = useState(null);
  const [selectImage, setSelectImage] = useState(0);
  const [selectFilt, setSelectFilt] = useState(0);
  const [currentIndex, setCurrentIndex] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [washer, setWasher] = useState(null);
  const [loading, setLoading] = useState(true);

  const carouselRef = useRef()

  const checkAccount = async () => {
    const token = await AsyncStorage.getItem("token");
    if (token != null) {
      const washer = await AsyncStorage.getItem("washer")
      const res = await axios.get(domain_web + "/" + washer + "/get_work_time");
      if (Object.keys(res.data).length != 0) {
        navigation.navigate('MakingOrderScreen');
      } else {
        Alert.alert("Ошибка", "В данную автомойку нельзя записаться");
      }
    } else {
      Alert.alert('Внимаение', 'Вы не авторизованы', [{ 'text': 'Ок' }, {
        'text': 'Войти', onPress: async () => {
          await AsyncStorage.multiRemove((await AsyncStorage.getAllKeys()).filter(obj => obj != "first_join_app"));
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }]
            }));
        }
      }])
    }
  }
  const goToCatalog = () => {
    navigation.navigate("Catalog");
  }

  useFocusEffect(useCallback(() => {
    setWasher(null);
    setFilt(null);
    setCurrentIndex([]);
    setPhoto(null);
    setSelectFilt(0);
    setSelectImage(0);
    setLoading(true);
    navigation.setOptions({
      title: 'ЗАГРУЗКА...',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#6E7476',

      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        textTransform: 'uppercase',
        fontFamily: 'Raleway_700Bold',
      },
      headerLeft: () => (
        <TouchableOpacity style={{ left: 10 }} onPress={() => route.params.from == "map" ? navigation.navigate('Map') : goToCatalog()
        } activeOpacity={0.7} >
          <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
        </TouchableOpacity >
      ),
      headerRight: () => (
        <TouchableOpacity style={{ right: 20 }} onPress={checkAccount} activeOpacity={0.7}>
          <Ionicons name='cart-outline' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      )
    });
    (async () => {
      const token = await AsyncStorage.getItem("token");
      const washer = await AsyncStorage.getItem("washer");
      setWasher(washer);
      const res = await axios.get(domain_web + `/get_washer/${washer}`)
      setFilt(Object.keys(res.data.photo));
      setCurrentIndex(new Array(Object.keys(res.data.photo).length).fill(0));
      setPhoto(res.data.photo);
      navigation.setOptions({
        title: res.data.washer.name_washer
      })
    })();
  }, []));

  if (photo === null) {
    return (
      <View style={[styles.container, { width: "100%", height: "100%", justifyContent: 'center', alignItems: "center" }]}>
        <ActivityIndicator size="large" color="white" />
      </View>)
  }

  const handleLoad = () => {
    setLoading(false);
  }

  const renderPhoto = ({ item, index }) => {
    return (
      <View style={{ alignItems: 'center' }}>
        {loading && <Skeleton color='#7C8183' w={'97%'} h={'100%'} />}
        <FastImage
          style={{ width: "97%", height: "100%" }}
          width="97%"
          height="100%"
          onLoad={handleLoad}
          source={{
            uri: domain_web + item.photo,
            priority: index == 0 ? FastImage.priority.high : index == 1 ? FastImage.priority.normal : FastImage.priority.low
          }
          } />
        {/* resizeMethod='auto' resizeMode='contain' */}
      </View>
    );
  }

  const horizontalCarousel = ({ item, index }) => {
    return ( // Внутрянняя
      <View style={{ width: "100%", height: "87%" }} >
        <Carousel
          data={photo[item]}
          renderItem={renderPhoto}
          sliderWidth={Dimensions.get("window").width * 0.9}
          itemWidth={Dimensions.get("window").width * 0.8}
          onSnapToItem={ind => setCurrentIndex([...currentIndex.slice(0, index), ind, ...currentIndex.slice(index + 1,)])}

        />
        <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'Raleway_700Bold', color: '#fff', marginTop: '2%' }} >{item}</Text>
        <Pagination
          activeDotIndex={currentIndex[index]}
          dotsLength={photo[item].length}
          dotStyle={{ backgroundColor: '#7BCFD6', width: 15, height: 15, borderRadius: 50 }}
        />
      </View>
    )
  }

  return ( // Внешняя
    <View style={styles.container}>
      <StatusBar />
      <Pagination
        activeDotIndex={selectFilt}
        dotsLength={filt.length}
        vertical={true}
        containerStyle={{ position: 'absolute', zIndex: 1, height: '100%' }}
        // dotColor='#7BCFD6'
        dotStyle={{ backgroundColor: '#7BCFD6', width: 15, height: 15, borderRadius: 50 }}
        dotContainerStyle={{ height: '5%' }}
      />
      <View style={{ alignItems: 'flex-end', width: "100%" }}>
        <Carousel
          ref={carouselRef}
          data={filt}
          renderItem={horizontalCarousel}
          sliderHeight={Dimensions.get("window").height}
          itemHeight={Dimensions.get('window').height}
          vertical={true}
          onSnapToItem={(ind) => { setSelectFilt(ind); }}
        // containerCustomStyle={{backgroundColor:'#f0f'}}
        /></View>

    </View>
  );
}

export default PointCarWash

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6E7476',
    flex: 1,
    flexDirection: "row",
  },
  main: {
    padding: '5%',
  },
  // конец главного контейнера




  subtext: {
    fontSize: 8,
    color: '#CBCBCB',
    fontFamily: 'Raleway_400Regular'
  },



  mt_TouchOpac: {
    marginTop: '5%',
  },
  gradient_background: {
    borderRadius: 5,
    padding: '5%',
  },
  gradient_btn: {
    borderRadius: 5,
    justifyContent: 'center',
    paddingVertical: '4%',
    paddingHorizontal: '7%',
  },
  stocks: {
    marginTop: '0%',
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Raleway_700Bold',
    textTransform: 'uppercase',
  },
  subtext_stocks: {
    fontSize: 8,
    color: '#5A5A5A',
    fontFamily: 'Raleway_400Regular'
  },
  text_stocks: {
    marginTop: '3%',
    fontSize: 14,
    color: '#6E7476',
    fontFamily: 'Raleway_400Regular'
  },



  city: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular'
  },
  gradient_line: {
    marginBottom: '10%',
    height: 2,
    borderRadius: 5,
  },






  text_in_item: {
    marginTop: '15%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular'
  },
  rating: {
    borderRadius: 5,
    justifyContent: 'center',
    padding: '2%',
  },

})

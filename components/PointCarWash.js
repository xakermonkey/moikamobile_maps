import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, Dimensions, Alert, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import { domain_web } from '../domain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
// import Carousel, { Pagination } from 'react-native-snap-carousel';
import { StatusBar } from 'expo-status-bar';
import FastImage from 'react-native-fast-image';
import { Skeleton } from 'react-native-skeleton-loaders'
import NetInfo from "@react-native-community/netinfo";
import ErrorNetwork from '../components/ErrorNetwork';

import Carousel from 'react-native-reanimated-carousel';
import PaginationDot from 'react-native-animated-pagination-dot'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function PointCarWash({ navigation, route }) {

  const [photo, setPhoto] = useState(null);
  const [filt, setFilt] = useState(null);
  const [selectImage, setSelectImage] = useState(0);
  const [selectFilt, setSelectFilt] = useState(0);
  const [currentIndex, setCurrentIndex] = useState([]);
  const [washer, setWasher] = useState(null);
  const [loading, setLoading] = useState(true);

  const [networkError, setNetworkError] = useState(false);
  const [titleError, setTitleError] = useState("Пытаемся установить соединение с сервером");
  const [repeatFunc, setRepeatFunc] = useState(null);

  // const carouselRef = useRef()

  const goToCatalog = () => {
    navigation.navigate("Catalog");
  }


  const nav = () => {
    if (route.params.from == "map") {
      navigation.goBack();
    } else {
      goToCatalog();
    }
  }

  const getDataFromServer = async () => {
    try {
      setTitleError("Пытаемся установить соединение с сервером");
      const id = await AsyncStorage.getItem("washer")
      const res = await axios.get(domain_web + `/get_washer/${id}`);
      setWasher(res.data.washer);
      setFilt(Object.keys(res.data.photo));
      setCurrentIndex(new Array(Object.keys(res.data.photo).length).fill(0));
      setPhoto(res.data.photo);
      navigation.setOptions({
        headerTitle: () => (
          <Text numberOfLines={1} style={{
            textTransform: 'uppercase',
            fontSize: 20,
            fontFamily: 'Raleway_700Bold', color: '#fff'
          }}>{res.data.washer.name_washer}</Text>
        ),
      })
      setNetworkError(false);
    } catch {
      setTitleError("Ошибка при получении данных. Проверьте соединение.");
      setRepeatFunc(() => checkInternet);
      setNetworkError(true);
    }

  }
  const checkInternet = async () => {
    setTitleError("Пытаемся установить соединение с сервером");
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setTitleError("Ошибка сети. Проверьте интернет соединение.");
      setRepeatFunc(() => checkInternet);
      setNetworkError(true);
    } else {
      setNetworkError(false);
      getDataFromServer();
    }
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
      headerTitle: () => (
        <Text numberOfLines={1} style={{
          textTransform: 'uppercase',
          fontSize: 20,
          fontFamily: 'Raleway_700Bold', color: '#fff'
        }}>ЗАГРУЗКА...</Text>
      ),

      headerLeft: () => (
        <TouchableOpacity style={{ left: Platform.OS == 'ios' ? 0 : 0 }} onPress={nav} activeOpacity={0.7} >
          <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
        </TouchableOpacity >
      ),
      headerRight: () => (
        <TouchableOpacity style={{ right: 10 }} onPress={() => navigation.openDrawer()} activeOpacity={0.7}>
          <Ionicons name='menu-sharp' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
        // <TouchableOpacity style={{ right: Platform.OS == 'ios' ? 0 : 0 }} onPress={checkAccount} activeOpacity={0.7}>
        //   <Ionicons name='cart-outline' size={28} color={'#7CD0D7'} />
        // </TouchableOpacity>
      )
    });
    (async () => {
      await checkInternet();
    })();
  }, []));



  if (networkError) {
    return (
      <ErrorNetwork reconnectServer={repeatFunc} title={titleError} />
    )
  }

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
        {loading && <Skeleton color='#7C8183' w={'80%'} h={'100%'} />}
        <FastImage
          style={{ width: "97%", height: "100%" }}
          width="97%"
          height="100%"
          onLoad={handleLoad}
          resizeMode='contain'
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
      <View>
        <View style={{ alignItems: 'flex-end' }}>

          <Carousel
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
            loop={false}
            width={Dimensions.get("window").width}
            height={Dimensions.get("window").height * 0.8}
            data={photo[item]}
            scrollAnimationDuration={700}
            onSnapToItem={ind => setCurrentIndex([...currentIndex.slice(0, index), ind, ...currentIndex.slice(index + 1,)])}
            renderItem={renderPhoto}
          />

        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'Raleway_700Bold', color: '#fff', marginTop: '2%' }} >{item}</Text>
          <PaginationDot
            activeDotColor={'#7BCFD6'}
            curPage={currentIndex[index]}
            maxPage={photo[item].length}
            sizeRatio={1.6}
          /></View>
      </View>
      // <View style={{ width: "100%", height: "87%" }} >
      //   <Carousel
      //   // enableMomentum={true}
      //   // decelerationRate={0.9}
      //     data={photo[item]}
      //     renderItem={renderPhoto}
      //     sliderWidth={Dimensions.get("window").width * 0.9}
      //     itemWidth={Dimensions.get("window").width * 0.8}
      //     onSnapToItem={ind => setCurrentIndex([...currentIndex.slice(0, index), ind, ...currentIndex.slice(index + 1,)])}

      //   />
      //   <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'Raleway_700Bold', color: '#fff', marginTop: '2%' }} >{item}</Text>
      //   <Pagination
      //     activeDotIndex={currentIndex[index]}
      //     dotsLength={photo[item].length}
      //     dotStyle={{ backgroundColor: '#7BCFD6', width: 15, height: 15, borderRadius: 50 }}
      //   />
      // </View>
    )
  }

  return ( // Внешняя
      <View style={styles.container}>
        <StatusBar />

        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginLeft: '3%', justifyContent: 'center', width: '5%' }}>
            
            <PaginationDot
              activeDotColor={'#7BCFD6'}
              curPage={selectFilt}
              maxPage={filt.length}
              sizeRatio={1.6}
              vertical={true}
            />
            </View>

          <Carousel
            loop={false}
            panGestureHandlerProps={{
              activeOffsetY: [-10, 10],
            }}
            width={Dimensions.get("window").width}
            height={Dimensions.get("window").height}
            data={filt}
            scrollAnimationDuration={700}
            onSnapToItem={(ind) => { setSelectFilt(ind); }}
            renderItem={horizontalCarousel}
            vertical={true}
          />

        </View>
        {/* <Pagination
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
        // enableMomentum={false}
        // decelerationRate={'normal'}
          ref={carouselRef}
          data={filt}
          renderItem={horizontalCarousel}
          sliderHeight={Dimensions.get("window").height}
          itemHeight={Dimensions.get('window').height}
          vertical={true}
          onSnapToItem={(ind) => { setSelectFilt(ind); }}
        // containerCustomStyle={{backgroundColor:'#f0f'}}
        />
        </View> */}

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

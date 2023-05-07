import React, { useLayoutEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text, Platform } from 'react-native';
import { Video } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel, { Pagination } from 'react-native-snap-carousel';
// import Carousel, { Pagination } from '@types/react-native-snap-carousel';
import { StatusBar } from 'expo-status-bar';


function HowItWorksScreen({ navigation }) {

  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [videos, setVideos] = useState([
    ["Авторизация", require('../assets/videos/auth.mp4')],
    ["Оформление заказа", require('../assets/videos/order.mp4')],
    ["Добавление автомобиля", require('../assets/videos/add_car.mp4')]]);
  const [ios_videos, setIOSVideos] = useState([
    ["Авторизация", require('../assets/videos/ios/auth.mp4')],
    ["Оформление заказа", require('../assets/videos/ios/order.mp4')],
    ["Добавление автомобиля", require('../assets/videos/ios/add_car.mp4')]]);

  const [selectSnap, setSelectSnap] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'КАК ЭТО РАБОТАЕТ?',
      headerBackTitleVisible: false,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#6E7476',
      },
      headerTintColor: '#fff',
      // headerTitleStyle: {
      //   fontWeight: 'bold',
        fontFamily: 'Raleway_700Bold',
      // },
      headerLeft: () => (
        <TouchableOpacity style={{left:15}} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <AntDesign name="close" size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      )
    });
    (async () => {
      await AsyncStorage.setItem("first_join_app", "true");
    })();
  }, [navigation]);

  const horizontalCarousel = ({ item, index }) => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: 'center',padding:10 }} >
        <Video
          ref={video}
          style={{ height: "100%", width: "100%", borderRadius:5  }}
          source={Platform.OS == 'ios' ? ios_videos[index][1] : videos[index][1]}
          useNativeControls
          resizeMode="contain"
          isLooping
          onPlaybackStatusUpdate={status => setStatus(() => status)}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar/>
        <Carousel
          data={Platform.OS == 'ios' ? ios_videos : videos}
          style={{ flex: 1 }}
          renderItem={horizontalCarousel}
          sliderWidth={Dimensions.get("window").width}
          itemWidth={Dimensions.get('window').width}
          onSnapToItem={(ind) => { setSelectSnap(ind); }}
        />
      <View style={{flex:1 }} >
        <Text style={{fontFamily:'Raleway_700Bold', textTransform:'uppercase', color:'#fff', fontSize:18, marginTop:'5%'}}>{videos[selectSnap][0]}</Text>
        <Pagination
          activeDotIndex={selectSnap}
          dotsLength={Platform.OS == 'ios' ? ios_videos.length : videos.length}
          containerStyle={{ height: '100%' }}
          // dotColor='#7BCFD6'
          dotStyle={{ backgroundColor: '#7BCFD6', width: 15, height: 15, borderRadius: 50 }}
          dotContainerStyle={{ height: '5%' }}
        />
      </View>
    </View>
  );
}

export default HowItWorksScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6E7476',
    alignItems: "center",
  },
  img: {
    height: '100%',
    width: '100%'
  },
})
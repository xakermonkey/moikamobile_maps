import React, { useLayoutEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text, Platform, Image } from 'react-native';
import { Video } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function HowItWorksScreen({ navigation }) {

  const [status, setStatus] = useState({});

  const [videos, setVideos] = useState([
    ["Авторизация", Platform.OS == 'ios' ? require('../assets/videos/ios/auth.mp4') : require('../assets/videos/auth.mp4'), false],
    ["Оформление заказа", Platform.OS == 'ios' ? require('../assets/videos/ios/order.mp4') : require('../assets/videos/order.mp4'), false],
    ["Добавление автомобиля", Platform.OS == 'ios' ? require('../assets/videos/ios/add_car.mp4') : require('../assets/videos/add_car.mp4'), false]]);

    const videoRefs = useRef(videos.map(() => React.createRef()));

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
        <TouchableOpacity style={{left:Platform.OS == 'ios' ? 15 : 0}} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <AntDesign name="close" size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      )
    });
    (async () => {
      await AsyncStorage.setItem("first_join_app", "true");
    })();
  }, [navigation]);

  const handlePlay = (index) => {
    console.log(videos[index][2]);
    setVideos((prevVideos) => {
      const newVideos = [...prevVideos];
      newVideos[index][2] = true;
      return newVideos;
    });
    videoRefs.current[index].current.playAsync();
  };

  const handleStop = (index) => {
    setVideos((prevVideos) => {
      const newVideos = prevVideos.map((video) => ({ ...video, [2]: false }));
      return newVideos;
    });
    videoRefs.current.forEach((ref) => {
      ref.current.pauseAsync();
    });
  };



  const horizontalCarousel = ({ item, index }) => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: 'center',padding:10 }} >
        <Video
          ref={videoRefs.current[index]}
          style={{ height: "100%", width: "100%", borderRadius:5  }}
          source={videos[index][1]}
          useNativeControls
          resizeMode="contain"
          onPlaybackStatusUpdate={status => setStatus(() => status)}
        />
        {!videos[index][2] && (
        <TouchableOpacity style={{position: 'absolute'}} onPress={() => handlePlay(index)} >
          <MaterialCommunityIcons name="play" size={64} color="#fff" />
        </TouchableOpacity>
      )}

      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar/>
      <View style={{ height:'70%' }}>
        <Carousel
        enableMomentum={true}
        decelerationRate={0.9}
          data={videos}
          // style={{ flex: 1 }}
          renderItem={horizontalCarousel}
          sliderWidth={Dimensions.get("window").width}
          itemWidth={Dimensions.get('window').width}
          onSnapToItem={(ind) => { setSelectSnap(ind); handleStop(ind); }}
        />
        </View>
      <View style={{ height:'30%' }} >
        <Text style={{fontFamily:'Raleway_700Bold', textTransform:'uppercase', color:'#fff', fontSize:18, marginTop:'5%'}}>{videos[selectSnap][0]}</Text>
        <Pagination
          activeDotIndex={selectSnap}
          dotsLength={videos.length}
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
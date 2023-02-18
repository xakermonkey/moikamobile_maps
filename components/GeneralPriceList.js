import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';
import { domain_mobile, domain_web } from '../domain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';


function GeneralPriceList({ navigation }) {

  const [cars, setCars] = useState([]);
  const [myCars, setMyCars] = useState([]);

  useLayoutEffect(() => {
    (async () => {
      try {
        const washer = await AsyncStorage.getItem("washer")
        const res = await axios.get(domain_web + `/get_body/${washer}`);
        setCars(res.data);
        const token = await AsyncStorage.getItem("token");
        const ret = await axios.get(domain_mobile + "/api/get_cars", {headers: {"Authorization": "Token " + token}});
        setMyCars(ret.data.map(obj => obj.body))
      }
      catch (err) {
        console.log(err);
      }
    })();
  }, [navigation]);


  const setBody = async (obj) => {
    await AsyncStorage.setItem("car", obj.id.toString());
    await AsyncStorage.setItem("car_name", obj.name);
    navigation.navigate('PriceListFor');
  }

  return (
    <View style={styles.container}>
      <StatusBar/>
      <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      {/* <BlurView intensity={100} style={styles.blurContainer}> */}
      <View style={styles.blurContainer}>
        <View style={[styles.row, { justifyContent: 'center', marginTop: '5%', width: "100%" }]}>
          <TouchableOpacity style={{ flex:1 }} onPress={() => navigation.navigate('PointCarWash')} activeOpacity={0.7} >
            <Ionicons name='close' size={28} color={'#7CD0D7'} />
          </TouchableOpacity>
          <Text style={[styles.bold_text, {flex:4}]}>ТИП КУЗОВА</Text>
          <View style={{ flex:1 }}></View>
        </View>

        <ScrollView style={styles.mt}>
          {cars.filter(obj => myCars.indexOf(obj.name) != -1).map((obj) => {
            return (
              <TouchableOpacity key={obj.id} onPress={() => setBody(obj)} activeOpacity={0.7} >
                <LinearGradient
                  colors={['#01010199', '#35343499']}
                  start={[0, 1]}
                  style={styles.gradient_background} >
                  <View style={styles.row}>
                    <Image source={require('../assets/images/catalog_img.png')}></Image>
                    <Text style={styles.stocks}>{obj.name}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* </BlurView> */}
      </View>
    </View>
  );
}

export default GeneralPriceList
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  image: {
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    flex: 1,
    padding: '5%',
    // padding: 20,
    // justifyContent: 'center',
  },
  bold_text: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Raleway_700Bold',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  gradient_background: {
    marginTop: '5%',
    borderRadius: 5,
    padding: '5%',
  },
  subtext: {
    fontSize: 8,
    color: '#CBCBCB',
    fontFamily: 'Raleway_400Regular'
  },
  text: {
    marginTop: '2%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular',
  },
  mt: {
    marginTop: '5%',
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
  },

  stocks: {
    marginLeft: '8%',
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


  text_btn: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Raleway_400Regular',
    textTransform: 'uppercase',
    paddingVertical: '5%',
  },
  bg_img: {
    alignItems: 'center',
  },
  // конец кнопки
});


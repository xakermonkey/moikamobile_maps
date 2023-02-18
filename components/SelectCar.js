import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_mobile } from '../domain';
import { StatusBar } from 'expo-status-bar';

function SelectCar({ navigation }) {
  const [selectCar, setSelectCar] = useState();
  const [cars, setCars] = useState([]);



  useLayoutEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      const body = await AsyncStorage.getItem("car_name")
      const res = await axios.get(domain_mobile + "/api/get_cars", { headers: { "authorization": "Token " + token } });
      setCars(res.data.filter(obj => obj.body == body));
    })();
  }, [navigation])

  const clickCar = (number) => {
    if (selectCar == number){
      setSelectCar(null);
    }else{
      setSelectCar(number);
    }
  }

  const clickNext = async () => {
    if (selectCar != null){
      await AsyncStorage.setItem("car_number", selectCar);
      navigation.navigate("SelectPaymentMethod");
    }
  }


  return (
    <View style={styles.container}>
      <StatusBar/>
      <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      <View style={styles.blurContainer}>
        <View style={[styles.row, { justifyContent: 'center', alignItems: "center", width: "100%", marginTop: '5%' }]}>
          {/* <View style={styles.row}> */}
          <TouchableOpacity style={{ flex:1 }} onPress={() => navigation.navigate('SelectDate')} activeOpacity={0.7} >
            <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => navigation.navigate('AddCarInMakingOrder')} activeOpacity={0.7} style={{}}>
            <AntDesign name='pluscircleo' size={28} color={'#7CD0D7'} />
          </TouchableOpacity> */}
          {/* </View> */}
          <Text style={[styles.main_text, {flex:5}]}>Выберите авто</Text>
          <View style={{flex:1}}></View>
        </View>

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          {cars.map(obj => {
            return (
              <View key={obj.id} >
                <TouchableOpacity activeOpacity={0.7} onPress={() => clickCar(obj.number)} style={styles.margin_TouchOpac}>
                  <View style={[styles.row, {height:28}]}>
                    <Text style={[styles.text, {width:'40%'}]}>{obj.body}</Text>
                    <Text style={[styles.bold_text, {width:'40%'}]}>{obj.number}</Text>
                    {selectCar == obj.number ? <FontAwesome5 name='check' size={28} color={'#7CD0D7'} style={{width:'10%'}}/> : <View style={{width:'10%'}}></View>}
                  </View>
                </TouchableOpacity>
                <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
              </View>
            )
          })}
        </LinearGradient>

        <TouchableOpacity activeOpacity={0.8} onPress={clickNext} style={{ marginTop: '5%' }} >
          <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
            <Text style={styles.text_btn} >Далее</Text>
          </ImageBackground>
        </TouchableOpacity>

      </View>
    </View>
  );
}

export default SelectCar

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
  main_text: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Raleway_700Bold',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  bold_text: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
  },
  gradient_background: {
    marginTop: '5%',
    borderRadius: 5,
    padding: '5%',
  },
  subtext: {
    fontSize: 8,
    color: '#B2B2B2',
    fontFamily: 'Montserrat_400Regular',
  },
  text: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat_400Regular',
  },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },

  gradient_line: {
    marginTop: '5%',
    marginBottom: '5%',
    height: 2,
    borderRadius: 5,
  },
  margin_TouchOpac: {
    marginRight: '5%',
    height:28
    // marginTop: '5%',
  },


  text_btn: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_400Regular',
    textTransform: 'uppercase',
    paddingVertical: '5%',
  },
  bg_img: {
    alignItems: 'center',
  },
  // конец кнопки
});


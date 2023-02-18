import React, { useLayoutEffect, useState } from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';


function SuccessfulOrder({ navigation }) {


  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [id, setId] = useState("");

  useLayoutEffect(() => {
    (async () => {
      setTime(await AsyncStorage.getItem("order_time"));
      setDate(await AsyncStorage.getItem("order_day"));
      setId(await AsyncStorage.getItem("order_id"));
    })();
  }, [navigation]);


  return (
    <SafeAreaView style={styles.container} >
      <StatusBar/>
      <View style={styles.main}>

        <View style={{ alignItems: 'center' }}>
          <View style={styles.row}>
            <Text style={styles.bold_text} >Заказ №</Text>
            <Text style={styles.bold_text} >{id}</Text>
          </View>
          <Text style={styles.bold_text} >Успешно оформлен</Text>
          <View style={styles.row}>
            <Text style={styles.bold_text} >Дата записи </Text>
            <Text style={styles.bold_text} >{time} {date}</Text>
          </View>
        </View>

        <View style={styles.logo}>
          <Image source={require('../assets/images/logo_succes.png')} />
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={() =>
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "PersonalAccount" }]
            }))
          // navigation.navigate('PersonalAccount') 
        } style={styles.mt} >
          <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
            <Text style={styles.text_btn} >Перейти в личный кабинет</Text>
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => 
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Map" }]
          }))
          // navigation.navigate('Map')
          } activeOpacity={0.7} style={styles.mt}>
          <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_btn} >
            <View style={styles.text_with_background}>
              <Text style={styles.btn_text}>На главную</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>



      </View>
    </SafeAreaView>
  );
}

export default SuccessfulOrder


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6E7476',
    flex: 1,
  },
  main: {
    padding: '5%',
    marginTop: '25%',
  },


  logo: {
    marginTop: '10%',
    alignItems: 'center',
  },


  gradient_btn: {
    borderRadius: 5,
    justifyContent: 'center',
    padding: 1,
  },


  btn_text: {
    fontFamily: 'Raleway_400Regular',
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
    paddingVertical: '5%',
  },
  text_with_background: {
    alignItems: 'center',
    backgroundColor: '#6E7476',
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
  },
  mt: {
    marginTop: '5%'
  },
  bold_text: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Raleway_700Bold',
    textTransform: 'uppercase',
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


})

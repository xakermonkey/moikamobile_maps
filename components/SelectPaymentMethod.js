import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { CheckBox, Icon } from 'react-native-elements';
import { CheckBox, Icon } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_mobile } from '../domain';
import { StatusBar } from 'expo-status-bar';

function SelectPaymentMethod({ navigation }) {
  const [payment, setPayment] = useState();
  const [uncache, setUncache] = useState(true);
  const [token, setToken] = useState(null);

  


  useLayoutEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      setToken(token);
      const ch = await AsyncStorage.getItem("uncache");
      if (ch == "false") {
        setUncache(false);
      } else {
        setUncache(true);
      }
    })();
  }, [])


  const clickNext = async () => {
    if (payment != null) {
      await AsyncStorage.setItem("payment", payment);
      navigation.navigate('OrderСompletion');
    }

  }

  return (
    <View style={styles.container}>
      <StatusBar/>
      <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      <View style={styles.blurContainer}>
        <View style={[styles.row, { justifyContent: 'center', alignItems: "center", width: "100%", marginTop: '5%' }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('SelectCar')} activeOpacity={0.7} >
            <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
          </TouchableOpacity>
          <Text style={[styles.bold_text, { flex: 4 }]}>Способ оплаты</Text>
          <View style={{ flex: 1 }}></View>
        </View>

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View>
            {uncache &&
              <View style={styles.checkbox}>
                <CheckBox containerStyle={{ padding: 0, margin: 0, marginRight: 0, marginLeft: 0, backgroundColor: null }}
                  checkedIcon={
                    <Icon name="radio-button-checked" type="material" color="#7BCFD6" size={25} />
                  }
                  uncheckedIcon={
                    <Icon name="radio-button-unchecked" type="material" color="#7BCFD6" size={25} />
                  }
                  checked={payment == "Безналичный расчёт"}
                  onPress={() => setPayment("Безналичный расчёт")}
                />
                <Text style={styles.text_check}>Безналичный расчёт</Text>
              </View>
            }
            <View style={styles.checkbox}>
              <CheckBox containerStyle={{ padding: 0, margin: 0, marginRight: 0, marginLeft: 0, backgroundColor: null }}
                checkedIcon={
                  <Icon name="radio-button-checked" type="material" color="#7BCFD6" size={25} />
                }
                uncheckedIcon={
                  <Icon name="radio-button-unchecked" type="material" color="#7BCFD6" size={25} />
                }
                checked={payment == "Наличный расчёт"}
                onPress={() => setPayment("Наличный расчёт")}
              />
              <Text style={styles.text_check}>Наличный расчёт</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, }}>
              <CheckBox containerStyle={{ padding: 0, margin: 0, marginRight: 0, marginLeft: 0, backgroundColor: null }}
                checkedIcon={
                  <Icon name="radio-button-checked" type="material" color="#7BCFD6" size={25} />
                }
                uncheckedIcon={
                  <Icon name="radio-button-unchecked" type="material" color="#7BCFD6" size={25} />
                }
                checked={payment == "Юридическое лицо"}
                onPress={() => setPayment("Юридическое лицо")}
              />
              <Text style={styles.text_check}>Юридическое лицо</Text>
            </View>

          </View>
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

export default SelectPaymentMethod

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
    // marginTop: '5%',
  },
  text_check: {
    marginLeft: '5%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat_400Regular',
  },
  checkbox: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: '10%',
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


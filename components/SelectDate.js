import React, { useLayoutEffect, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image, Alert, Platform, TouchableWithoutFeedback, ActivityIndicator, Keyboard, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { domain_web } from '../domain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import ErrorNetwork from '../components/ErrorNetwork';

function SelectDate({ navigation }) {
  // const [check4, setCheck4] = useState(false);
  const [selectDay, setSelectDay] = useState();
  const [data, setData] = useState();
  const [selectTime, setSelectTime] = useState();
  const [bDay, setBDay] = useState(false);
  const [bTime, setBTime] = useState(false);

  const [networkError, setNetworkError] = useState(false);
  const [titleError, setTitleError] = useState("Пытаемся установить соединение с сервером");
  const [repeatFunc, setRepeatFunc] = useState(null);

  const getDataFromServer = async () => {
    const washer = await AsyncStorage.getItem("washer");
    const number = await AsyncStorage.getItem("car_number");
    try {
      setTitleError("Пытаемся установить соединение с сервером");
      const res = await axios.get(domain_web + "/" + washer + "/get_work_time",
        {
          params: {
            car_number: number
          }
        }
      );
      setNetworkError(false);
      setData(res.data);
      if (Object.keys(res.data).length != 0) {
        setSelectDay(Object.keys(res.data)[0]);
        setSelectTime(res.data[Object.keys(res.data)[0]][0]);
      } else {
        Alert.alert("Ошибка", "У данной автомойки еще нет графика работ");
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Catalog" }]
          }));
        return;
      }
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
      setRepeatFunc(() => checkInternet)
      setNetworkError(true);
    } else {
      setNetworkError(false);
      getDataFromServer();
    }
  }


  useLayoutEffect(() => {
    (async () => {
      await checkInternet();
    })();
  }, [navigation])


  const clickNext = async () => {
    await AsyncStorage.setItem("order_time", selectTime);
    await AsyncStorage.setItem("order_day", selectDay);
    navigation.navigate('SelectPaymentMethod');
  }


  const goBack = async () => {
    let keys = await AsyncStorage.getAllKeys()
    await AsyncStorage.multiRemove(keys.filter(key => key.startsWith("stock") || key.startsWith("servise_")))
    navigation.navigate('PriceListFor')
  }

  const daySelector = async (value) => {
    setSelectDay(value); setSelectTime(data[value][0]);
    setBDay(false)
  }
  const timeSelector = async (value) => {
    setSelectTime(value);
    setBTime(false)
  }

  if (networkError) {
    return (
      <ErrorNetwork reconnectServer={repeatFunc} title={titleError} />
    )
  }

  if (selectDay == undefined) {
    return (
      <View style={styles.container}>
        <StatusBar />
        <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
        <View style={{ justifyContent: 'space-evenly', alignItems: 'center', padding: '5%', flex: 1 }}>
          <Image source={require('../assets/images/logo_succes.png')} />
          <Text style={[styles.bold_text, { textAlign: 'center' }]}>Подбираем для вас время</Text>
          <ActivityIndicator size='large' />
        </View>
      </View>
      // <View style={{ backgroundColor: '#6E7476', flex: 1 }}>
      //   <StatusBar />
      //   <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, padding: '5%' }}>
      //     <Image source={require('../assets/images/logo_succes.png')} />
      //     <Text style={[styles.bold_text, { textAlign: 'center' }]}>Подбираем для вас время</Text>
      //   </View>
      // </View>
    )
  }
  return (
    <View style={styles.container}>
      <StatusBar />
      <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      <View style={styles.blurContainer}>
        <TouchableWithoutFeedback onPress={() => { setBDay(false); setBTime(false) }} accessible={false} >
          <View style={[styles.row, { alignItems: 'center', justifyContent: 'center', marginTop: '10%', width: "100%" }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={goBack} activeOpacity={0.7} >
              <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
            </TouchableOpacity>
            <Text style={[styles.bold_text, { flex: 5 }]}>Выберите дату записи</Text>
            <View style={{ flex: 1 }}></View>
          </View>
        </TouchableWithoutFeedback>


        {Platform.OS === 'ios' ?
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <TouchableOpacity activeOpacity={0.8} onPress={() => { setBDay(!bDay); setBTime(false) }} >
              <View >
                <Text style={styles.subtext}>дата</Text>
                <Text style={styles.text}>{selectDay}</Text>
              </View>
            </TouchableOpacity>
            {bDay && <Picker
              selectedValue={selectDay}
              onValueChange={(value, index) => daySelector(value)}>
              {Object.keys(data).map((obj, ind) => <Picker.Item color='#fff' key={ind} label={obj} value={obj} />)}
            </Picker>}
          </LinearGradient> :

          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <Text style={styles.subtext}>дата</Text>
            <Picker
              style={{ color: '#fff', marginHorizontal: '-5%', marginBottom: '-5%' }}
              selectedValue={selectDay}
              onValueChange={(value, index) => { setSelectDay(value); setSelectTime(data[value][0]) }}>
              {Object.keys(data).map((obj, ind) => <Picker.Item key={ind} label={obj} value={obj} />)}
            </Picker>
          </LinearGradient>
        }


        {Platform.OS === 'ios' ?
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <TouchableOpacity activeOpacity={0.8} onPress={() => { setBTime(!bTime); setBDay(false) }} >
              <View >
                <Text style={styles.subtext}>время</Text>
                <Text style={styles.text}>{selectTime}</Text>
              </View>
            </TouchableOpacity>
            {bTime && <Picker
              selectedValue={selectTime}
              onValueChange={(value, index) => timeSelector(value)}>
              {data[selectDay].map((obj, ind) => <Picker.Item color='#fff' key={ind} label={obj} value={obj} />)}
            </Picker>}
          </LinearGradient> :

          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <Text style={styles.subtext}>время</Text>
            <Picker
              style={{ color: '#fff', marginHorizontal: '-5%', marginBottom: '-5%' }}
              selectedValue={selectTime}
              onValueChange={(value, index) => { setSelectTime(value) }}>
              {data[selectDay].map((obj, ind) => <Picker.Item key={ind} label={obj} value={obj} />)}
            </Picker>
          </LinearGradient>
        }


        <TouchableOpacity activeOpacity={0.8} onPress={clickNext} style={{ marginTop: '5%' }} >
          <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
            <Text style={styles.text_btn} >Далее</Text>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => { setBDay(false); setBTime(false) }} accessible={false} >
          <View style={{ height: '100%' }}></View>
        </TouchableWithoutFeedback>

      </View>
    </View>
  );
}

export default SelectDate

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
    fontSize: 11,
    color: '#B2B2B2',
    fontFamily: 'Montserrat_400Regular',
  },
  text: {
    marginTop: '2%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat_400Regular',
  },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'
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

import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_mobile, domain_web } from '../domain';
import { Picker } from '@react-native-picker/picker';
import MaskInput from 'react-native-mask-input'
import { CommonActions } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import NetInfo from "@react-native-community/netinfo";
import ErrorNetwork from '../components/ErrorNetwork';

function AddEditCar({ navigation, route }) {

  const [body, setBody] = useState(route.params.body);
  const [number, setNumber] = useState(route.params.number);
  const [id, setId] = useState(route.params.id);
  const [carBody, setCarBody] = useState([]);
  const [bCar, setBCar] = useState(false);
  const [mask, setMask] = useState([/[А|В|Е|К|М|Н|О|Р|С|Т|У|Х]/, /\d/, /\d/, /\d/, /[А|В|Е|К|М|Н|О|Р|С|Т|У|Х]/, /[А|В|Е|К|М|Н|О|Р|С|Т|У|Х]/, /\d/, /\d/, /\d/]);



  const [networkError, setNetworkError] = useState(false);
  const [titleError, setTitleError] = useState("Пытаемся установить соединение с сервером");
  const [repeatFunc, setRepeatFunc] = useState(null);

  const getDataFromServer = async () => {
    try {
      setTitleError("Пытаемся установить соединение с сервером");
      const res = await axios.get(domain_web + "/get_body");
      setCarBody(res.data)
      if (body == "") {
        setBody(res.data[0].name);
      }
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
      setRepeatFunc(() => checkInternet)
      setNetworkError(true);
    } else {
      setNetworkError(false);
      getDataFromServer();
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.title,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#6E7476',
      },
      headerTitleStyle: {
        color: '#fff',
        textTransform: 'uppercase',
      },
      headerLeft: () => (
        <TouchableOpacity style={{ left: 0 }} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name='close' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      ),
    });
    (async () => {
      await checkInternet();
    })();
  }, [navigation]);

  const saveCar = async () => {

    setTitleError("Пытаемся установить соединение с сервером");
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setTitleError("Ошибка сети. Проверьте интернет соединение.");
      setRepeatFunc(() => saveCar)
      setNetworkError(true);
      return;
    }
    try {
      if (number.length >= 8) {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.post(domain_mobile + "/api/edit_car",
          {
            "id": id,
            "number": number,
            "body": body
          },
          {
            headers: {
              "Authorization": "Token " + token
            }
          }
        );
        setNetworkError(false);
        if (res.data.status) {
          if (route.params.id == null) {
            const cars = await AsyncStorage.getItem("cars")
            await AsyncStorage.setItem("cars", (parseFloat(cars) + 1).toString());
          }

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "PersonalAccountScreen" }, { name: "MyCars" }]
            }));
        } else {
          setNetworkError(false);
          Alert.alert("Ошибка", "У Вас уже есть автомобиль с таким номером");
        }
      }
    }
    catch (err) {
      setTitleError("Ошибка сети. Проверьте интернет соединение.");
      setRepeatFunc(() => saveCar)
      setNetworkError(true);
    }

  }

  if (networkError) {
    return (
      <ErrorNetwork reconnectServer={repeatFunc} title={titleError} />
    )
  }
  return (
    <View style={styles.container}>
      <StatusBar />
      <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      {/* <BlurView intensity={100} style={styles.blurContainer}> */}
      <View style={styles.blurContainer}>
        {/* <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{}}>
          <Ionicons name='close' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.bold_text}>{route.params.title}</Text>
        </View> */}

        {Platform.OS === 'ios' ?
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >

            <View style={styles.mt}>
              <Text style={styles.subtext}>тип кузова</Text>
              <TouchableOpacity style={styles.row} onPress={() => setBCar(!bCar)}>
                <Text style={styles.text}>{body}</Text>
                <Ionicons name='chevron-forward' size={24} style={{ color: '#7CD0D7' }} />
              </TouchableOpacity>
              {bCar && <Picker
                selectedValue={body}
                onValueChange={(value, index) => setBody(value)}
                itemStyle={{ height: 150 }}
              >
                {carBody.map((obj, ind) => <Picker.Item color='#fff' key={ind} label={obj.name} value={obj.name} />)}
              </Picker>}
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
            </View>

            <View style={styles.mt}>
              <Text style={styles.subtext}>номер автомобиля</Text>
              <MaskInput style={[styles.text, { width: '100%' }]} maxLength={9} autoCapitalize="characters" value={number} mask={mask} onChangeText={(masked, unmasked) => setNumber(masked)} />
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
            </View>
          </LinearGradient> :

          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background_android} >

            <View style={styles.mt}>
              <Text style={styles.subtext_android}>тип кузова</Text>
              <Picker
                selectedValue={body}
                onValueChange={(value, index) => setBody(value)}
                itemStyle={{}}
                style={{ color: '#fff' }}
              >
                {carBody.map((obj, ind) => <Picker.Item key={ind} label={obj.name} value={obj.name} />)}
              </Picker>
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line_android} />
            </View>

            <View style={styles.mt}>
              <Text style={styles.subtext_android}>номер автомобиля</Text>
              <MaskInput style={[styles.text, { width: '100%', color: '#fff', marginLeft: '5%' }]} placeholderTextColor='#fff' maxLength={9} autoCapitalize="characters" value={number} mask={mask} onChangeText={(masked, unmasked) => setNumber(masked)} />
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line_android} />
            </View>
          </LinearGradient>
        }

        <TouchableOpacity activeOpacity={0.8} onPress={saveCar} style={{ marginTop: '5%' }} >
          <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
            <Text style={styles.text_btn} >Сохранить</Text>
          </ImageBackground>
        </TouchableOpacity>

        {/* </BlurView> */}
      </View>
    </View>
  );
}

export default AddEditCar
const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    // marginTop:'5%',
  },
  mt: {
    marginTop: 0
  },

  gradient_line: {
    marginVertical: '5%',
    height: 2,
    borderRadius: 5,
  },
  gradient_line_android: {
    marginHorizontal: '5%',
    marginVertical: '5%',
    height: 2,
    borderRadius: 5,
  },

  image: {
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  bold_text: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Raleway_700Bold',
    textTransform: 'uppercase',
  },
  gradient_background: {
    marginTop: '5%',
    borderRadius: 5,
    padding: '5%',
  },
  gradient_background_android: {
    marginTop: '5%',
    borderRadius: 5,
    // padding: '5%',
  },
  subtext: {
    fontSize: 11,
    color: '#B2B2B2',
    fontFamily: 'Montserrat_400Regular',
  },
  subtext_android: {
    marginLeft: '5%',
    marginTop: '5%',
    fontSize: 11,
    color: '#B2B2B2',
    fontFamily: 'Montserrat_400Regular',
  },

  text: {
    // marginLeft:'5%',
    marginTop: '2%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat_400Regular',
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
  // конец кнопки ок
});


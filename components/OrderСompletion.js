import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ImageBackground, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, Fontisto } from '@expo/vector-icons';
import { useLayoutEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { domain_mobile, domain_web } from '../domain';
import axios from 'axios';
import { CommonActions } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from "expo-linking";
import { res } from 'react-email-validator';
function OrderСompletion({ navigation }) {


  const [payment, setPayment] = useState();
  const [car, setCar] = useState();
  const [time, setTime] = useState();
  const [date, setDate] = useState();
  const [servise, setServise] = useState([]);
  const [sale, setSale] = useState(0);
  const [total, setTotal] = useState(0);
  const [body, setBody] = useState();
  const [washer, setWasher] = useState();
  const [disable, setDisable] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [token, setToken] = useState(null);
  const [linkListener, setLinkListener] = useState(null);
  const [payUri, setPayUri] = useState(null);

  useLayoutEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token")
      setToken(token);
      setCar(await AsyncStorage.getItem("car_name"));
      setTime(await AsyncStorage.getItem("order_time"));
      setDate(await AsyncStorage.getItem("order_day"));
      setWasher(await AsyncStorage.getItem("washer"));
      const sale = await AsyncStorage.getItem("sale")
      setSale(sale);
      const payment = await AsyncStorage.getItem("payment");
      setPayment(payment);
      let params = new Object();
      params["servise"] = new Array();
      const keys = await (await AsyncStorage.getAllKeys()).filter(key => key.startsWith("servise"));
      for (let i = 0; i < keys.length; i++) {
        params.servise = [...params.servise, await AsyncStorage.getItem(keys[i])];
      }
      setBody(await AsyncStorage.getItem("car"))
      params["body"] = await AsyncStorage.getItem("car");
      const res = await axios.get(domain_web + "/get_servise_order", {
        params: params
      });
      setServise(res.data);
      let totalPrice = 0;
      res.data.map(obj => { if (obj.price != "Д/ц") { totalPrice += parseInt(obj.price) } });
      setTotal(sale == 0 ? totalPrice : totalPrice * (1 - sale / 100));
      if (payment == "Безналичный расчёт") {
        Linking.createURL("payment", { queryParams: { "status": true } });
        const total = await AsyncStorage.getItem("total_price");
        const res = await axios.post(domain_mobile + "/api/create_payment",
          { "price": parseFloat(total) }, { headers: { "Authorization": "Token " + token } });
        const { hostname, path, queryParams } = Linking.parse(res.data.uri);
        setUuid(queryParams.orderId);
        setPayUri(res.data.uri);
      }
    })();
  }, [navigation])


  const checkPayment = useCallback(async () => {
    const res = await axios.post(domain_mobile + "/api/check_payment", { "uuid": uuid }, { headers: { "Authorization": "Token " + token } });
    if (res.data.status) {
      createOrder();
    } else {
      Alert.alert("Внимание!", "Оплата была незавершена или отменена");
    }
  }, [token, uuid])


  const handler = useCallback(async (event) => {
    WebBrowser.dismissBrowser();
    try {
      await checkPayment();
    } catch (err) {
      console.log(err);
    }
  }, [uuid, token])



  const PayOrder = useCallback(async () => {
    if (payment == "Безналичный расчёт") {    
      if (linkListener == null){
        const listener = Linking.addEventListener("url", handler);
        setLinkListener(listener);
      }
      const results = await WebBrowser.openBrowserAsync(payUri);
      if (results.type != "dismiss") {
        await checkPayment();
      }
      return;
    } else {
      createOrder();
    }
  }, [payUri, linkListener])


  const createOrder = async () => {
    setDisable(true);
    try {
      const phone = await AsyncStorage.getItem("phone");
      const res = await axios.post(domain_web + "/create_order",
        {
          washer: washer,
          time: time,
          date: date,
          car: body,
          sale: sale,
          servise: servise.map(obj => obj.id),
          payment: payment == "Юридическое лицо" ? "Юр. лицо" : payment,
          phone: phone,
          number: await AsyncStorage.getItem("car_number")
        });
      await AsyncStorage.setItem("order_id", res.data.id.toString());
      const token = await AsyncStorage.getItem("token");
      const create = await axios.post(domain_mobile + "/api/create_order",
        {
          id: res.data.id
        },
        {
          headers: {
            "Authorization": "Token " + token
          }
        });
      let keys = await AsyncStorage.getAllKeys()
      await AsyncStorage.multiRemove(keys.filter(key => key.startsWith("stock") || key.startsWith("servise_")))
      navigation.navigate("CarWashes");
      setTimeout(() => navigation.navigate("Successful"), 1000)
    } catch (err) {
      console.log(err);
      Alert.alert("Упс", "Даннное время уже забронировано");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "GeneralPriceList" }, { name: "PriceListFor" }, { name: "SelectDate" }]
        }));
      setDisable(false);
      // navigation.navigate("SelectDate")
      return;
    }

  }


  return (
    <View style={styles.container}>
      <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      <View style={styles.blurContainer}>
        <View style={[styles.row, { justifyContent: 'center', alignItems: "center", width: "100%", marginTop: '5%' }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('SelectPaymentMethod')} activeOpacity={0.7} >
            <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
          </TouchableOpacity>
          <Text style={[styles.bold_text, { flex: 4 }]}>Завершение заказа</Text>
          <View style={{ flex: 1 }}></View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            {/* <View style={styles.gradient_background_padding}>
              <Text style={styles.subtext}>номер заказа</Text>
              <Text style={styles.text}>№0001 10.01.2021</Text>
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
            </View> */}
            <View style={styles.gradient_background_padding}>
              <Text style={styles.subtext}>авто</Text>
              <Text style={styles.text}>{car}</Text>
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
            </View>
            <View style={styles.gradient_background_padding}>
              <Text style={styles.subtext}>дата записи</Text>
              <Text style={styles.text}>{time} {date}</Text>
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
            </View>
            <View style={styles.gradient_background_padding}>
              <Text style={styles.subtext}>выбранные услуги</Text>
              {servise.map(obj => {
                return (
                  <View style={styles.view_row} key={obj.id}>
                    <Text style={[styles.text, { width: '70%' }]}>{obj.name}</Text>
                    <Text style={styles.text}>{obj.price}</Text>
                  </View>
                )
              })}
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
            </View>
            <View style={styles.gradient_background_padding}>
              <Text style={styles.subtext}>скидка</Text>
              <Text style={styles.text}>{sale}%</Text>
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
            </View>
            <View style={styles.gradient_background_padding}>
              <Text style={styles.subtext}>итого</Text>
              <Text style={styles.text}>{Math.ceil(parseInt(total) * (1 - parseInt(sale) / 100))}</Text>
            </View>
          </LinearGradient>

          {/* <TouchableOpacity activeOpacity={0.7} style={styles.mt_TouchOpac}> */}
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <View >
              <Text style={styles.subtext}>cпособ оплаты</Text>
              <Text style={styles.text}>{payment}</Text>
            </View>
          </LinearGradient>
          {/* </TouchableOpacity> */}

          {/* <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <View style={styles.gradient_background_padding}>
              <TouchableOpacity activeOpacity={0.7} style={styles.margin_TouchOpac}>
                <View style={styles.row}>
                  <Fontisto name='visa' size={28} color={'#7CD0D7'} />
                  <Text style={styles.bold_text}>VISA 8765</Text>
                  <FontAwesome5 name='check' size={28} color={'#7CD0D7'} />
                </View>
              </TouchableOpacity>
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
              <TouchableOpacity activeOpacity={0.7} style={styles.margin_TouchOpac}>
                <View style={styles.row}>
                  <Fontisto name='visa' size={28} color={'#7CD0D7'} />
                  <Text style={styles.bold_text}>VISA 8765</Text>
                  <FontAwesome5 name='check' size={28} color={'#7CD0D7'} />
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient> */}

          <TouchableOpacity activeOpacity={0.8} onPress={PayOrder} disabled={disable} style={styles.mt_TouchOpac} >
            <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
              <Text style={styles.text_btn}>Оформить заказ</Text>
            </ImageBackground>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

export default OrderСompletion

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
  gradient_line: {
    marginVertical: '5%',
    height: 2,
    borderRadius: 5,
  },

  view_row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },

  subtext: {
    fontSize: 11,
    color: '#CBCBCB',
    fontFamily: 'Montserrat_400Regular'
  },
  text: {
    marginTop: '2%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat_400Regular'
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
  // конец кнопки выйти

  mt_TouchOpac: {
    marginTop: '5%',
    marginBottom: '20%',
  },
  // мэрджн сверху у всех кнопок

})

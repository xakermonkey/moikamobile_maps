import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLayoutEffect, useState } from 'react';
import axios from 'axios';
import { domain_web } from '../domain';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import NetInfo from "@react-native-community/netinfo";
import ErrorNetwork from '../components/ErrorNetwork';

function OrderDetails({ navigation, route }) {


  const [order, setOrder] = useState(null);
  const [servise, setServise] = useState([]);
  const [loading, setLoading] = useState(false);

  const [networkError, setNetworkError] = useState(false);
  const [titleError, setTitleError] = useState("Пытаемся установить соединение с сервером");
  const [repeatFunc, setRepeatFunc] = useState(null);


  const getDataFromServer = async () => {
    try {
      setTitleError("Пытаемся установить соединение с сервером");
      const res = await axios.get(domain_web + "/get_detail_order_" + route.params.orderId)
      setOrder(res.data.order);
      setServise(res.data.servise);
      setNetworkError(false);
    } catch {
      setTitleError("Ошибка при получении данных. Проверьте соединение.");
      setRepeatFunc(() => checkInternet);
      setNetworkError(true);
      return;
    }

  }

  const checkInternet = async () => {
    setTitleError("Пытаемся установить соединение с сервером");
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setTitleError("Ошибка сети. Проверьте интернет соединение.");
      setNetworkError(true);
      setRepeatFunc(() => checkInternet);
    } else {
      setNetworkError(false);
      getDataFromServer();
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'ПОДРОБНОСТИ ЗАКАЗА',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#6E7476',
      },
      headerTitleStyle: {
        color: '#fff',
        textTransform: 'uppercase',
      },
      headerLeft: () => (
        <TouchableOpacity style={{ left: 0 }} onPress={() => navigation.navigate('MyOrders')} activeOpacity={0.7}>
          <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
        </TouchableOpacity>
      ),
    });
    (async () => {
      await checkInternet();
    })();
  }, [navigation])

  const deleteOrder = async () => {
    setTitleError("Пытаемся установить соединение с сервером");
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setTitleError("Ошибка сети. Проверьте интернет соединение.");
      setNetworkError(true);
      setRepeatFunc(() => deleteOrder);
    } else {
      setLoading(true);
      try {
        const res = await axios.get(domain_web + "/delete_order_" + route.params.orderId);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "PersonalAccountScreen" }, { name: "MyOrders" }]
          }));
      }
      catch {
        setTitleError("Ошибка при удалении заказа. Проверьте соединение.");
        setRepeatFunc(() => deleteOrder);
        setNetworkError(true);
      }
      setLoading(false);
    }



  }


  if (networkError) {
    return (
      <ErrorNetwork reconnectServer={repeatFunc} title={titleError} />
    )
  }


  if (order == null | loading) {
    return (
      <View style={styles.container} >
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} >
      <StatusBar />
      <ScrollView style={styles.main}>

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>номер заказа</Text>
            <Text style={styles.text}>№{order.id}</Text>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>автомобиль</Text>
            <Text style={styles.text}>{order.car.name} {order.number}</Text>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>дата записи</Text>
            <Text style={styles.text}>{order.hour}:{order.minute.length == 2 ? order.minute : "0" + order.minute} {order.day.length == 2 ? order.day : "0" + order.day}.{order.mounth.length == 2 ? order.mounth : "0" + order.mounth}.{order.year}</Text>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>статус</Text>
            <Text style={styles.text}>{order.status}</Text>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>способ оплаты</Text>
            <Text style={styles.text}>{order.payment_form}</Text>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>информация</Text>
            {servise.map(obj => {
              return (<View key={obj[0]} style={styles.view_row}>
                <Text style={[styles.text, { width: '70%' }]}>{obj[0]}</Text>
                <Text style={styles.text}>{obj[1]} руб</Text>
              </View>)
            })}
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>скидка</Text>
            <Text style={styles.text}>{order.discount}%</Text>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>{order.status == "Готов" ? "итого" : "предварительная стоимость"}</Text>
            <Text style={styles.text}>{order.status == "Готов" ? order.end_price : Math.floor(order.start_price * (1 - (parseInt(order.discount) / 100)))} руб</Text>
          </View>
        </LinearGradient>
        {order.status == "Готов" ?
          (order.comment == null && <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('EvaluateService', route.params)} style={styles.mt_TouchOpac} >
            <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
              <Text style={styles.text_btn} >Оценить обслуживание</Text>
            </ImageBackground>
          </TouchableOpacity>) :
          (order.status == "Запланирован" && <TouchableOpacity activeOpacity={0.8} onPress={deleteOrder} style={styles.mt_TouchOpac} >
            <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
              <Text style={styles.text_btn} >ОТМЕНИТЬ ЗАКАЗ</Text>
            </ImageBackground>
          </TouchableOpacity>)
        }

      </ScrollView>
    </SafeAreaView>
  );
}

export default OrderDetails

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6E7476',
    flex: 1,
  },
  main: {
    padding: '5%',
  },
  // конец главного контейнера


  gradient_background: {
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

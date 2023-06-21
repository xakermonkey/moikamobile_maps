import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text, Image, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useLayoutEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_web } from '../domain';
import { StatusBar } from 'expo-status-bar';
import NetInfo from "@react-native-community/netinfo";
import ErrorNetwork from '../components/ErrorNetwork';
function PriceListFor({ navigation, route }) {

  const [body, setBody] = useState("");
  const [stock, setStock] = useState([]);
  const [selectStock, setSelectStock] = useState([]);
  const [servise, setServise] = useState();
  const [selectServise, setSelectServise] = useState([]);
  const [dcPrice, setDcPrice] = useState([]);
  const [total, setTotal] = useState(0);

  const [networkError, setNetworkError] = useState(false);
  const [titleError, setTitleError] = useState("Пытаемся установить соединение с сервером");
  const [repeatFunc, setRepeatFunc] = useState(null);

  const getDataFromServer = async () => {
    setBody(await AsyncStorage.getItem("car_name"));
    const washer = await AsyncStorage.getItem("washer");
    const car = await AsyncStorage.getItem("car");
    try {
      setTitleError("Пытаемся установить соединение с сервером");
      const st = await axios.get(domain_web + '/get_stock');
      setStock(st.data);
      const res = await axios.get(domain_web + `/${washer}/get_servise/${car}`);
      setServise(res.data);
      const keys = Object.keys(res.data);
      for (let i = 0; i < keys.length; i++) {
        for (let j = 0; j < res.data[keys[i]].length; j++) {
          if (res.data[keys[i]][j].price == "Д/ц") {
            setDcPrice([...dcPrice, res.data[keys[i]][j].id])
          }
        }
      }
      setNetworkError(false);
    } catch {
      setTitleError("Ошибка при получении данных. Проверьте соединение.");
      setRepeatFunc(checkInternet);
      setNetworkError(true);
    }

  }
  const checkInternet = async () => {
    setTitleError("Пытаемся установить соединение с сервером");
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setTitleError("Ошибка сети. Проверьте интернет соединение.");
      setRepeatFunc(checkInternet)
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


  const clickServise = (obj) => {
    if (selectServise.indexOf(obj.id) == -1) {
      setSelectServise([...selectServise, obj.id]);
      if (obj.price != "Д/ц") {
        setTotal(total + parseInt(obj.price))
      }
    } else {
      setSelectServise(selectServise.filter(item => item != obj.id));
      if (obj.price != "Д/ц") {
        setTotal(total - parseInt(obj.price))
      }
    }
    // console.log(total);
  }


  const clickStock = (id) => {
    if (selectStock.indexOf(id) == -1) {
      setSelectStock([...selectStock, id]);
    } else {
      setSelectStock([...selectStock.slice(0, selectStock.indexOf(id)), ...selectStock.slice(selectStock.indexOf(id) + 1,)]);
    }
  }



  const NextStep = async () => {
    if (selectServise.length != 0) {
      await AsyncStorage.setItem("uncache", "true");
      if (selectStock.length != 0) {
        await AsyncStorage.setItem("uncache", "false");
        for (let i = 0; i < selectStock.length; i++) {
          await AsyncStorage.setItem(`stock_${i}`, selectStock[i].toString());
        }
      }
      for (let i = 0; i < selectServise.length; i++) {
        await AsyncStorage.setItem(`servise_${i}`, selectServise[i].toString());
        if (dcPrice.indexOf(selectServise[i]) != -1) {
          await AsyncStorage.setItem("uncache", "false");
        }
      }
      await AsyncStorage.setItem("total_price", total.toString());
      navigation.navigate('SelectCar');
    }
  }

  const RenderStock = () => {
    return (
      <LinearGradient
        colors={['#01010199', '#35343499']}
        start={[0, 1]}
        style={styles.gradient_background} >
        <View style={{ padding: '5%' }}>
          <Text style={styles.bold_text}>Акции</Text>
          {stock.map((obj, ind) => {
            return (<View key={obj.id}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => clickStock(obj.id)} style={styles.margin_TouchOpac}>
                <View style={styles.row}>
                  <Text style={styles.service_text}>{obj.text}</Text>
                  {selectStock.indexOf(obj.id) != -1 && <FontAwesome5 name='check' size={28} color={'#7CD0D7'} style={{ height: 28 }} />}
                </View>
              </TouchableOpacity>
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
            </View>
            )
          })}
        </View>
      </LinearGradient>
    )
  }


  const RenderServse = ({ cat }) => {
    return (
      servise[cat].map((obj) => {
        return (
          <View key={obj.id}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => clickServise(obj)} style={styles.margin_TouchOpac}>
              <View style={styles.row}>
                <Text style={styles.service_text}>{obj.name}</Text>
                <Text style={styles.text}>{obj.price}</Text>
                {selectServise.indexOf(obj.id) != -1 && <FontAwesome5 name='check' size={28} color={'#7CD0D7'} />}
              </View>
            </TouchableOpacity>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
        )
      })
    )
  }


  const RenderPrice = () => {
    if (servise == undefined) {
      return (
        <View style={[styles.container, { width: "100%", height: "100%", justifyContent: 'center', alignItems: "center" }]}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )
    }
    return (Object.keys(servise).map((obj, ind) => {
      return (
        <LinearGradient key={ind}
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View style={{ padding: '5%' }}>
            <Text style={styles.subtext}>{obj}</Text>
            <RenderServse cat={obj} />

            <Text style={styles.dc_text}>*Д/Ц - Договорная цена</Text>
          </View>
        </LinearGradient>
      )
    })
    )
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
      <View style={styles.blurContainer}>

        <View style={[styles.row, { justifyContent: 'center', marginTop: '10%', width: "100%" }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('GeneralPriceList')} activeOpacity={0.7}  >
            <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
          </TouchableOpacity>
          <Text style={[styles.bold_text, { flex: 5 }]}>Прайс-лист "{body}"</Text>
          <View style={{ flex: 1 }}></View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <RenderStock />

          <RenderPrice />

          <TouchableOpacity activeOpacity={0.8} onPress={NextStep} style={{ marginTop: '5%' }} >
            <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
              <Text style={styles.text_btn} >Далее</Text>
            </ImageBackground>
          </TouchableOpacity>

        </ScrollView>

      </View>
    </View>
  );
}

export default PriceListFor

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  // конец главного контейнера

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


  text: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular',
  },
  service_text: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular',
    width: '70%',
    height: '100%',
  },
  bold_text: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Raleway_700Bold',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 11,
    color: '#B2B2B2',
    fontFamily: 'Raleway_400Regular'
  },
  dc_text: {
    marginTop: '4%',
    marginRight: '10%',
    fontSize: 11,
    color: '#B2B2B2',
    fontFamily: 'Raleway_400Regular',
    textAlign: 'right',
  },


  gradient_background: {
    borderRadius: 5,
    marginTop: '5%',
  },
  gradient_line: {
    marginTop: '5%',
    height: 2,
    borderRadius: 5,
  },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },

  margin_TouchOpac: {
    marginRight: '5%', marginTop: '5%',
    height: 28
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
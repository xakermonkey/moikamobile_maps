import React, { useState, useLayoutEffect, useCallback } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Image, Alert, FlatList, TouchableWithoutFeedback, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { domain_mobile, domain_web } from '../domain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from "expo-location"
import { getDistance } from "geolib"
import { Picker } from '@react-native-picker/picker';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';




function CarWashes({ navigation, route }) {

  const [washes, setWashes] = useState([]); // Массив автомоек
  const [stock, setStock] = useState([]); // Массив акций
  const [countCar, setCountCar] = useState(0); // Количество машин 
  const [location, setLocation] = useState(""); // Выбранный город
  const [coords, setCoords] = useState(null); // координаты устройство
  const [locations, setLocations] = useState([]); // Массив всех городов
  const [bView, setBVeiw] = useState(false); // Отображение Пикера (ios)
  const [loading, setLoading] = useState(false); // Отображение загрузки
  const [bLocation, setBLocation] = useState(false); // Вкл/Выкл геолокация


  const dist_sort = (a, b, coords) => { // функция сортировки моек по расстоянию 
    if (getDistance({ latitude: coords.coords.latitude, longitude: coords.coords.longitude }, { latitude: parseFloat(a.lat), longitude: parseFloat(a.lon) }) < getDistance(coords, { latitude: parseFloat(b.lat), longitude: parseFloat(b.lon) })) {
      return -1;
    }
    if (getDistance({ latitude: coords.coords.latitude, longitude: coords.coords.longitude }, { latitude: parseFloat(a.lat), longitude: parseFloat(a.lon) }) > getDistance(coords, { latitude: parseFloat(b.lat), longitude: parseFloat(b.lon) })) {
      return 1;
    }
    return 0
  }


  const rate_sort = (a, b) => { // функция сортировки моек по рейтингу
    if (a.rate.count_rate == 0) {
      return 1;
    }
    if (b.rate.count_rate == 0) {
      return -1;
    }
    if (a.rate.count_rate == 0 && b.rate.count_rate == 0) {
      return 0;
    }
    if ((a.rate.mean_rate / a.rate.count_rate).toFixed(2) < (b.rate.mean_rate / b.rate.count_rate).toFixed(2)) {
      return 1;
    }
    if ((a.rate.mean_rate / a.rate.count_rate).toFixed(2) > (b.rate.mean_rate / b.rate.count_rate).toFixed(2)) {
      return -1;
    }
    return 0

  }

  const washesSorted = (washes, coord) => { // сортировка моек
    if (route.params == undefined) { // если не переданы никакие параметры то сортируется по расстоянию
      if (coord == null) { // если не переданы координаты, значит локация выключена
        return washes;
      } else {
        return washes.sort((a, b) => dist_sort(a, b, coord)); // сортировка по расстоянию
      }
    }
    if (route.params.sorted == 1) { // сортировка по рейтингу 
      return washes.sort(rate_sort);;
    }
    else {
      if (coord == null) {
        return washes;
      } else {
        return washes.sort((a, b) => dist_sort(a, b, coord));
      }
    }
  }


  useLayoutEffect(() => { // вызывается при первом рендеринге
    navigation.setOptions({
      title: 'АВТОМОЙКИ', // текст заголовка
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#6E7476',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontFamily: 'Raleway_700Bold',
      },
      headerLeft: () => ( // левый компонент заголовка
        <TouchableOpacity style={{ left: 10 }} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.7}>
          <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
        </TouchableOpacity>
      ),
      headerRight: () => ( // правый компонент заголовка
        <TouchableOpacity style={{ right: 20 }} onPress={() => navigation.navigate('CarFilters', { 'sorted': route.params == undefined ? 0 : route.params.sorted, "filters": route.params == undefined ? [] : route.params.filters })} activeOpacity={0.7}>
          <FontAwesome name='filter' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      )
    });
    // console.log(route.params);
  }, [navigation]);



  useFocusEffect(useCallback(() => { // вызывается при каждом переходе на экран
    (async () => {
      if (route.params == undefined) { // если не переданы параметры
        await navigation.setParams({
          sorted: 0,
          filters: []
        });
      }
      let { status } = await Location.getForegroundPermissionsAsync(); // проверка прав на геолокацию
      const col = await Location.getLastKnownPositionAsync(); // получение координат последнего местоположение
      setBLocation(status === 'granted' && col != null) // true если есть права иначе false
      if (status !== 'granted' || col == null) { // если нет прав на определение геолокации 
        const viewAlert = await AsyncStorage.getItem("viewAlert");
        if (viewAlert == null) {
          Alert.alert("Внимание",
            "Для автоматического определения города и отображения расстояния до автомойки необходимо включить определение геопозиции");
          await AsyncStorage.setItem("viewAlert", "true");
        }

      }
      try {
        const ret = await axios.get(domain_web + "/get_country") // получение всех городов
        setLocations(ret.data.country) // передача городов в useState
        const location = await AsyncStorage.getItem("location"); // получение города из хранилища
        if (location != null) { // если город есть, то передаем его в useState
          setLocation(location)
        }
        else { // иначе берем первый город из ответа на запрос 
          setLocation(ret.data.country[0]);
        }
        const phone = await AsyncStorage.getItem("phone"); // получение телефона из хранилища
        const res = await axios.get(domain_web + "/get_catalog", // получение моек с фильтрами
          {
            params: {
              filter: route.params == undefined ? [] : route.params.filters,
              sorted: route.params == undefined ? 0 : route.params.sorted,
              location: location == null ? ret.data.country[0] : location,
              phone: phone
            }
          }
        );
        setCoords(col); // сохранение полученных координат в State
        setWashes(washesSorted(res.data.washer, col)); // сортировка моек и сохранение в State
        setStock(res.data.stock); // сохранение акций в State
        const token = await AsyncStorage.getItem("token"); // получение токена из хранилища
        if (token != null) { // если токен не равен null
          const cars = await axios.get(domain_mobile + "/api/get_cars", { headers: { "Authorization": "Token " + token } }); // запрос на получение машин пользователя
          setCountCar(cars.data.length); // сохранение ответа в useState
        } else {
          setCountCar(1) // если пользователь не авторизирован
        }
      }
      catch (err) {
        console.log(err);
      }
    })();
  }, []))



  const selectWasher = async (id, sale) => {
    if (countCar === 0) {
      Alert.alert("У вас еще нет машин!", "Для оформления заказа необходимо добавить машину у себя в профиле");
      return 0;
    }
    let keys = await AsyncStorage.getAllKeys()
    const stock = keys.filter(key => key.startsWith("stock"));
    for (let i = 0; i < stock.length; i++) {
      await AsyncStorage.removeItem(stock[i]);
    }
    const serv = keys.filter(key => key.startsWith("servise_"));
    for (let i = 0; i < serv.length; i++) {
      await AsyncStorage.removeItem(serv[i]);
    }
    await AsyncStorage.setItem("washer", id.toString());
    await AsyncStorage.setItem("sale", sale.toString());
    navigation.navigate("PointCarWash");
  }

  const [refreshing, setRefresing] = useState(false); // происходит ли обновление списка



  const newLocation = async (value) => { // изменение города
    setLoading(true); // устанавливаем загрузку в true
    setLocation(value); // передаем в useState название города (локации)
    await AsyncStorage.setItem("location", value); // сохранение города в хранилище
    const phone = await AsyncStorage.getItem("phone"); // получение номера из хранилища
    const res = await axios.get(domain_web + "/get_catalog",  // получение моек с фильтрами
      {
        params: {
          filter: route.params == undefined ? [] : route.params.filters,
          sorted: route.params == undefined ? 0 : route.params.sorted,
          location: value,
          phone: phone
        }
      }
    );
    const col = await Location.getLastKnownPositionAsync(); // получение координат последнего местоположения
    setCoords(col); // сохранение полученных координат в State
    setWashes(washesSorted(res.data.washer, col)); // сортировка моек и занесение их в State
    setStock(res.data.stock); // сохранение акций в State
    setLoading(false) // конец загрузки установка load в false
    setBVeiw(false)
  }


  const refresh = async () => { // функция при оттягивании списка вниз
    setRefresing(true); // установка загруки в true
    try {
      const phone = await AsyncStorage.getItem("phone"); // получение телефона из хранилища
      const res = await axios.get(domain_web + "/get_catalog", // запрос на получение моек с фильтрами
        {
          params: {
            filter: route.params == undefined ? [] : route.params.filters,
            sorted: route.params == undefined ? 0 : route.params.sorted,
            location: location, // location из State
            phone: phone
          }
        }
      );
      const col = await Location.getLastKnownPositionAsync(); // получние последнего местоположения
      setCoords(col); // сохранение полученных координат в State
      setWashes(washesSorted(res.data.washer, col)); // сортировка моек и сохранение в State
      setStock(res.data.stock); // сохранение в State акций
      const token = await AsyncStorage.getItem("token"); // получение токена авторизации 
      if (token != null) { // если пользователь авторизирован
        const cars = await axios.get(domain_mobile + "/api/get_cars", { headers: { "Authorization": "Token " + token } }); // отправка запроса на список машин пользователя
        setCountCar(cars.data.length); // сохранение количества машин

      } else {
        setCountCar(1); // если пользователь не авторизирован, то задаем количества машин равное 1, чтобы мог просматривать автомойки
      }
      setRefresing(false) // конец обновления
    }
    catch (err) {
      console.warn(err);
    }
  }

  const EmptyComponent = () => { // рендеринг в случае пустого массива моек
    return (
      <View style={{ marginTop: '5%' }}>
        <Text style={[styles.stocks, { textAlign: 'center' }]}>В данном городе автомоек с такими фильтрами нет</Text>
      </View>
    )
  }

  const ConvertDistance = (item) => {
    var dist = getDistance({ latitude: coords.coords.latitude, longitude: coords.coords.longitude }, { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) });
    if (dist < 1000){
      return dist + " м"
    }
    return (dist /1000).toFixed(2) + " км"
  }

  const renderWashes = ({ item }) => { // рендеринг мойки
    return (
      Platform.OS === 'ios' ? <TouchableOpacity onPress={() => selectWasher(item.id, item.sale)} activeOpacity={0.7} style={styles.mt_TouchOpac}>
        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Image cacheKey={item.avatar} source={{ uri: domain_web + item.avatar }} style={{ width: '28%', height: '100%', borderRadius: 5 }} width={95} height={95} resizeMode='center' />
            <View style={{ width: '43%' }}>
              <Text style={styles.stocks}>{item.address}</Text>
              <Text onPress={()=>{Linking.openURL('tel:'+item.phone);}} style={styles.text_in_item}>{item.phone}</Text>
              <Text style={styles.text_in_item}>Скидка {item.sale}%</Text>
              <Text style={styles.text_in_item}>{coords != null && "В " + ConvertDistance(item) + " от вас"}</Text>
            </View>
            <LinearGradient colors={['#FFF73780', '#FFF97480']} start={[1, 0]} style={styles.rating} >
              <Text style={styles.stocks}>{item.rate.count_rate == 0 ? "0.00" : (item.rate.mean_rate / item.rate.count_rate).toFixed(2)}</Text>
            </LinearGradient>
          </View>
        </LinearGradient>
      </TouchableOpacity> :

        <TouchableOpacity onPress={() => selectWasher(item.id, item.sale)} activeOpacity={0.7} style={styles.mt_TouchOpac}>
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Image source={{ uri: domain_web + item.avatar }} style={{ width: '28%', height: '100%', borderRadius: 5 }} width={95} height={95} resizeMode='center' />
              <View style={{ width: '50%' }}>
                <Text style={styles.stocks}>{item.address}</Text>
                <Text onPress={()=>{Linking.openURL('tel:'+item.phone);}} style={styles.text_in_item}>{item.phone}</Text>
                <Text style={styles.text_in_item}>Скидка {item.sale}%</Text>
                <Text style={styles.text_in_item}>{coords != null && "В " + ConvertDistance(item) + " от вас"}</Text>
              </View>
              <LinearGradient colors={['#FFF73780', '#FFF97480']} start={[1, 0]} style={styles.rating} >
                <Text style={styles.stocks}>{item.rate.count_rate == 0 ? "0.00" : (item.rate.mean_rate / item.rate.count_rate).toFixed(2)}</Text>
              </LinearGradient>
            </View>
          </LinearGradient>
        </TouchableOpacity>
    )
  }

  const renderStock = ({ item }) => { // рендеринг акций
    return (
      <TouchableOpacity activeOpacity={0.7} style={styles.mt_TouchOpac}>
        <LinearGradient colors={['#FFF737', '#7CD0D7']} start={[1, 0]} style={styles.gradient_btn} >
          <Text style={styles.subtext_stocks}>{item.date}</Text>
          <Text style={styles.text_stocks}>{item.text}</Text>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} >
      <StatusBar />
      <View style={styles.main}>
        <View style={{ zIndex: 1, height: Platform.OS === 'ios' ? 70 : '15%' }}>
          <Text style={styles.subtext}>местоположение</Text>
          {Platform.OS === 'ios' ?
            <View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setBVeiw(!bView)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '0%' }}>
                  <Text style={styles.city}>{location}</Text>
                  <Ionicons name='chevron-forward' size={24} style={{ color: '#7CD0D7' }} />
                </View>
              </TouchableOpacity>
              {bView &&

                <View style={{
                  zIndex: 11,
                  backgroundColor: '#6E7476', borderRadius: 5, shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 10,
                  },
                  shadowOpacity: 0.8,
                  shadowRadius: 15,
                }}>
                  <Picker
                    selectedValue={location}
                    itemStyle={{ height: 120 }}
                    onValueChange={(value, index) => newLocation(value)}>
                    {locations.map(obj => 
                    <Picker.Item color='#fff' key={obj} label={obj} value={obj} /> 
                    )}
                  </Picker>
                </View>
                }
            </View> :

            <Picker
              selectedValue={location}
              itemStyle={{}}
              style={{ marginHorizontal: '-5%', color: '#fff' }}
              onValueChange={(value, index) => newLocation(value)}>
              {locations.map(obj => <Picker.Item key={obj} label={obj} value={obj} />)}
            </Picker>
          }

          {!bView && <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />}
        </View>

        <TouchableWithoutFeedback onPress={() => setBVeiw(false)} accessible={false} >
        <View style={{height: Platform.OS === 'ios' ? '95%' : '85%'}}>
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={[styles.gradient_background, {maxHeight:'40%', marginBottom:5}]} >
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.stocks}>Акции</Text>
            </View>
            <FlatList
              style={{ marginTop: 5 }}
              showsVerticalScrollIndicator={false}
              data={stock}
              keyExtractor={item => item.text}
              renderItem={renderStock}
            />
          </LinearGradient>

          {!loading ?
            <FlatList
              style={{}}
              showsVerticalScrollIndicator={false}
              data={washes}
              keyExtractor={item => item.id}
              refreshing={refreshing}
              onRefresh={refresh}
              renderItem={renderWashes}
              ListEmptyComponent={<EmptyComponent />}
            />
            : <ActivityIndicator />}
        </View>
      </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>

  );
}

export default CarWashes

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6E7476',
    flex: 1,
  },
  main: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  // конец главного контейнера




  subtext: {
    fontSize: 11,
    color: '#CBCBCB',
    fontFamily: 'Raleway_400Regular'
  },



  mt_TouchOpac: {
    marginBottom: '5%',
  },
  gradient_background: {
    borderRadius: 5,
    padding: '5%',
  },
  gradient_btn: {
    borderRadius: 5,
    justifyContent: 'center',
    paddingVertical: '4%',
    paddingHorizontal: '7%',
  },
  stocks: {
    marginTop: '0%',
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



  city: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular'
  },
  gradient_line: {
    marginTop: '3%',
    marginBottom: '5%',
    height: 2,
    borderRadius: 5,
  },






  text_in_item: {
    // marginTop: '15%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular'
  },
  rating: {
    alignItems: 'center',
    width: '17%',
    borderRadius: 5,
    justifyContent: 'center',
    padding: '2%',
  },

})
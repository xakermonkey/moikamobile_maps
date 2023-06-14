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
import { Skeleton, SkeletonGroup } from 'react-native-skeleton-loaders'
import { CommonActions } from '@react-navigation/native';

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
  const [bPicker, setBPicker] = useState(false); // Вкл/Выкл геолокация


  const checkCar = async () => {
    setCountCar(parseFloat(await AsyncStorage.getItem("cars")));
  }


  const getGeoLocation = async () => {
    console.log("get location");
    const { status } = await Location.requestForegroundPermissionsAsync();
    const service = await Location.hasServicesEnabledAsync();
    if (status !== "granted" || !service) {
      const viewAlert = await AsyncStorage.getItem("viewAlert");
      if (viewAlert == null) {
        Alert.alert("Внимание",
          "Для автоматического определения города и отображения расстояния до автомойки необходимо включить определение геопозиции");
        await AsyncStorage.setItem("viewAlert", "true");
      }
      return null
    }
    const col = await Location.getLastKnownPositionAsync(); // получение координат последнего местоположение
    setBLocation(col != null) // true если есть права иначе false
    if (col == null) { // если нет прав на определение геолокации 
      const viewAlert = await AsyncStorage.getItem("viewAlert");
      if (viewAlert == null) {
        Alert.alert("Внимание",
          "Для автоматического определения города и отображения расстояния до автомойки необходимо включить определение геопозиции");
        await AsyncStorage.setItem("viewAlert", "true");
      }
    }
    setCoords(col); // сохранение полученных координат в State
    return col;
  }

  const getCity = async () => {
    console.log("get city");
    let countries = JSON.parse(await AsyncStorage.getItem("countries"));
    if (countries == null) {
      console.log("null countries");
      const ret = await axios.get(domain_web + "/get_country") // получение всех городов
      countries = ret.data.country
      AsyncStorage.setItem("countries", JSON.stringify(ret.data.country))
    }
    let location = await AsyncStorage.getItem("location"); // получение города из хранилища
    if (location != null) { // если город есть, то передаем его в useState
      setLocation(location)
    }
    else { // иначе берем первый город из ответа на запрос 
      location = countries[0]
      setLocation(countries[0]);
    }
    const index = countries.indexOf(location);
    countries.splice(index, 1);
    countries = [location, ...countries];
    setLocations(countries) // передача городов в useState
    console.log("location from city", location);
    return location
  }

  const loadCatalogData = async (stocks, washes, location, loc) => {
    console.log("load data");
    console.log("location from load data", location);
    if (stocks == null || washes == null) {
      const phone = await AsyncStorage.getItem("phone"); // получение телефона из хранилища
      const sorted = await AsyncStorage.getItem("sorted");
      const filters = await AsyncStorage.getItem("filters");
      const res = await axios.get(domain_web + "/get_catalog", // получение моек с фильтрами
        {
          params: {
            filter: JSON.parse(filters),
            sorted: parseInt(sorted),
            location: location,
            lat: loc?.coords.latitude,
            lon: loc?.coords.longitude,
            phone: phone
          }
        }
      );
      stocks = res.data.stock
      washes = res.data.washer
      setDataToStorage(stocks, washes);
    }
    setWashes(washes); // сортировка моек и сохранение в State
    setStock(stocks); // сохранение акций в State
    return { stocks, washes }
  }

  const getDataFromStorage = async () => {
    console.log("get data");
    let stocks = JSON.parse(await AsyncStorage.getItem("_stocks"));
    let washes = JSON.parse(await AsyncStorage.getItem("washeses"));
    return { stocks, washes }
  }

  const setDataToStorage = async (stocks, washes) => {
    console.log("set data");
    await AsyncStorage.setItem("_stocks", JSON.stringify(stocks));
    await AsyncStorage.setItem("washeses", JSON.stringify(washes));
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
        <TouchableOpacity style={{ left: Platform.OS == 'ios' ? 0 : 0 }} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.7}>
          <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
        </TouchableOpacity>
      ),
      headerRight: () => ( // правый компонент заголовка
        <TouchableOpacity style={{ right: Platform.OS == 'ios' ? 0 : 0 }} onPress={() => navigation.navigate('CarFilters', { 'sorted': route.params == undefined ? 0 : route.params.sorted, "filters": route.params == undefined ? [] : route.params.filters })} activeOpacity={0.7}>
          <FontAwesome name='filter' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      )
    });
  }, [navigation]);


  const checkUpdate = async () => {
    const loc = await getGeoLocation();
    try {
      const location = await getCity();
      await loadCatalogData(null, null, location, loc);
    }
    catch (err) {
      console.log(err);
    }

  }


  useFocusEffect(useCallback(() => { // вызывается при каждом переходе на экран
    (async () => {
      console.log("use focus");
      setBPicker(true);
      await checkCar();
      const loc = await getGeoLocation();
      try {
        const location = await getCity();
        let data = await getDataFromStorage();
        await loadCatalogData(data.stocks, data.washes, location, loc);
      }
      catch (err) {
        console.log(err);
      }
      setBPicker(false);
    })();
  }, []))



  const selectWasher = async (item) => {
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
    await AsyncStorage.setItem("washer", item.id.toString());
    await AsyncStorage.setItem("sale", item.sale.toString());
    await AsyncStorage.setItem("washer_phone", item.phone != null ? item.phone : "");
    await AsyncStorage.setItem("washer_data", JSON.stringify(item));
    // setLoading(true);
    // const res = await axios.get(domain_web + `/get_washer/${id}`);
    // await AsyncStorage.setItem("washer_data", JSON.stringify(res.data));
    // setLoading(false);
    // navigation.("PointCarWash", {from: "catalog"});
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MakingOrder", params: { from: "catalog" } }]
      }))
  }

  const [refreshing, setRefresing] = useState(false); // происходит ли обновление списка



  const newLocation = async (value) => { // изменение города
    console.log("new loc", value);
    setLoading(true); // устанавливаем загрузку в true
    setLocation(value); // передаем в useState название города (локации)
    await AsyncStorage.setItem("location", value); // сохранение города в хранилище
    const loc = await getGeoLocation();
    await loadCatalogData(null, null, value, loc);
    setLoading(false) // конец загрузки установка load в false
    setBVeiw(false)
  }


  const refresh = async () => { // функция при оттягивании списка вниз
    setRefresing(true); // установка загруки в true
    try {
      console.log("refresh");
      checkCar();
      const loc = await getGeoLocation();
      const location = await getCity();
      await loadCatalogData(null, null, location, loc);
      setRefresing(false) // конец обновления
    }
    catch (err) {
      console.warn(err);
    }
  }

  const EmptyComponent = () => { // рендеринг в случае пустого массива моек
    return (
      <SkeletonGroup numberOfItems={4} direction="column" stagger={{ delay: 1 }}>
        <Skeleton color='#7C8183' w={'100%'} h={100} />
      </SkeletonGroup>
      // <View style={{ marginTop: '5%' }}>
      //   <Text style={[styles.stocks, { textAlign: 'center' }]}>В данном городе автомоек с такими фильтрами нет</Text>
      //   <Skeleton color='#7C8183' w={'97%'} h={'100%'} />
      // </View>
    )
  }

  const ConvertDistance = (item) => {
    var dist = getDistance({ latitude: coords.coords.latitude, longitude: coords.coords.longitude }, { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) });
    if (dist < 1000) {
      return dist + " м"
    }
    return (dist / 1000).toFixed(2) + " км"
  }

  const renderWashes = ({ item }) => { // рендеринг мойки
    return (
      Platform.OS === 'ios' ? <TouchableOpacity onPress={() => selectWasher(item)} activeOpacity={0.7} style={styles.mt_TouchOpac}>
        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Image cacheKey={item.avatar} source={{ uri: domain_web + item.avatar }} style={{ width: '28%', height: '100%', borderRadius: 5 }} width={95} height={95} resizeMode='center' />
            <View style={{ width: '43%' }}>
              <Text style={styles.stocks}>{item.address}</Text>
              {item.phone &&
                <Text onPress={() => { Linking.openURL('tel:' + item.phone); }} style={styles.text_in_item}>{item.phone}</Text>}
              <Text style={styles.text_in_item}>Скидка {item.sale}%</Text>
              <Text style={styles.text_in_item}>{coords != null && "В " + ConvertDistance(item) + " от вас"}</Text>
            </View>
            <LinearGradient colors={['#FFF73780', '#FFF97480']} start={[1, 0]} style={styles.rating} >
              <Text style={styles.stocks}>{item.rate.toFixed(2)}</Text>
            </LinearGradient>
          </View>
        </LinearGradient>
      </TouchableOpacity> :

        <TouchableOpacity onPress={() => selectWasher(item)} activeOpacity={0.7} style={styles.mt_TouchOpac}>
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Image source={{ uri: domain_web + item.avatar }} style={{ width: '28%', height: '100%', borderRadius: 5 }} width={95} height={95} resizeMode='center' />
              <View style={{ width: '50%' }}>
                <Text style={styles.stocks}>{item.address}</Text>
                {item.phone &&
                  <Text onPress={() => { Linking.openURL('tel:' + item.phone); }} style={styles.text_in_item}>{item.phone}</Text>}
                <Text style={styles.text_in_item}>Скидка {item.sale}%</Text>
                <Text style={styles.text_in_item}>{coords != null && "В " + ConvertDistance(item) + " от вас"}</Text>
              </View>
              <LinearGradient colors={['#FFF73780', '#FFF97480']} start={[1, 0]} style={styles.rating} >
                <Text style={styles.stocks}>{item.rate.toFixed(2)}</Text>
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
              <TouchableOpacity activeOpacity={0.7} disabled={bPicker || refreshing || loading} onPress={() => setBVeiw(!bView)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '0%' }}>
                  <Text style={styles.city}>{location}</Text>
                  {bPicker || refreshing || loading ? <ActivityIndicator /> : <Ionicons name='chevron-forward' size={24} style={{ color: '#7CD0D7' }} />}
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ width: '90%' }}>
                <Picker
                  dropdownIconColor={0x6E7476ff}
                  dropdownIconRippleColor={0x6E7476ff}
                  enabled={(!bPicker) && (!refreshing) && (!loading)}
                  selectedValue={location}
                  style={{ marginHorizontal: '-5%', color: '#fff' }}
                  onValueChange={(value, index) => newLocation(value)}>
                  {locations.map(obj =>
                    <Picker.Item key={obj} label={obj} value={obj} />
                  )}
                </Picker>
              </View>
              {bPicker || refreshing || loading ? <ActivityIndicator /> : <Ionicons name='chevron-forward' size={24} style={{ color: '#7CD0D7' }} />}
            </View>
          }
          {!bView && <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />}
        </View>

        <TouchableWithoutFeedback onPress={() => setBVeiw(false)} accessible={false} >
          <View style={{ height: Platform.OS === 'ios' ? '95%' : '85%' }}>
            <LinearGradient
              colors={['#01010199', '#35343499']}
              start={[0, 1]}
              style={[styles.gradient_background, { maxHeight: '40%', marginBottom: 5 }]} >
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.stocks}>Акции</Text>
              </View>
              <FlatList
                style={{ marginTop: 5 }}
                showsVerticalScrollIndicator={false}
                data={stock}
                keyExtractor={item => item.text}
                renderItem={renderStock}
                ListEmptyComponent={<EmptyComponent />}
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
import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Image, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { domain_mobile, domain_web } from '../domain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from "expo-location"
import { getDistance } from "geolib"
import { Picker } from '@react-native-picker/picker';
import { DrawerActions } from '@react-navigation/native';





function CarWashes({ navigation, route }) {

  const [washes, setWashes] = useState([]);
  const [stock, setStock] = useState([]);
  const [countCar, setCountCar] = useState(0);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState({});
  const [locations, setLocations] = useState([]);
  const [bView, setBVeiw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bLocation, setBLocation] = useState(false);


  const dist_sort = (a, b, coords) => {
    if (getDistance(coords, { latitude: parseFloat(a.lat), longitude: parseFloat(a.lon) }) < getDistance(coords, { latitude: parseFloat(b.lat), longitude: parseFloat(b.lon) })) {
      return -1;
    }
    if (getDistance(coords, { latitude: parseFloat(a.lat), longitude: parseFloat(a.lon) }) > getDistance(coords, { latitude: parseFloat(b.lat), longitude: parseFloat(b.lon) })) {
      return 1;
    }
    return 0
  }


  const rate_sort = (a, b) => {
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

  const WashesSorted = (washes, coord) => {
    if (route.params == undefined) {
      if (coord == {}) {
        return washes;
      } else {
        return washes.sort((a, b) => dist_sort(a, b, coord));
      }
    }
    if (route.params.sorted == 1) {
      return washes.sort(rate_sort);;
    }
    else {
      if (coord == {}) {
        return washes;
      } else {
        return washes.sort((a, b) => dist_sort(a, b, coord));
      }
    }
  }


  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'АВТОМОЙКИ',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#6E7476',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontFamily: 'Raleway_700Bold',
      },
      headerLeft: () => (
        <TouchableOpacity style={{ left:10 }} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.7}>
          <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ right:20 }} onPress={() => navigation.navigate('CarFilters', { 'sorted': route.params == undefined ? 0 : route.params.sorted, "filters": route.params == undefined ? [] : route.params.filters })} activeOpacity={0.7}>
          <FontAwesome name='filter' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      )
    });
    (async () => {
      if (route.params == undefined) {
        await navigation.setParams({
          sorted: 0,
          filters: []
        });
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      setBLocation(status === 'granted')
      if (status !== 'granted') {
        Alert.alert("Ошибка", "Необходимо включить определение геопозиции");
      }

      try {
        const ret = await axios.get(domain_web + "/get_country")
        setLocations(ret.data.country)
        const location = await AsyncStorage.getItem("location");
        if (location != null) {
          setLocation(location)
        }
        else {
          setLocation(ret.data.country[0]);
        }
        const phone = await AsyncStorage.getItem("phone");
        const res = await axios.get(domain_web + "/get_catalog",
          {
            params: {
              filter: route.params == undefined ? [] : route.params.filters,
              sorted: route.params == undefined ? 0 : route.params.sorted,
              location: location == null ? ret.data.country[0] : location,
              phone: phone
            }
          }
        );
        if (status == "granted") {
          const col = await Location.getLastKnownPositionAsync();
          setCoords({ latitude: col.coords.latitude, longitude: col.coords.longitude });
          setWashes(WashesSorted(res.data.washer, { latitude: col.coords.latitude, longitude: col.coords.longitude }));
        } else {
          setWashes(res.data.washer.sort(rate_sort));
        }
        setStock(res.data.stock);
        const token = await AsyncStorage.getItem("token");
        if (token != null) {
          const cars = await axios.get(domain_mobile + "/api/get_cars", { headers: { "Authorization": "Token " + token } });
          setCountCar(cars.data.length);
        } else {
          setCountCar(1)
        }


      }
      catch (err) {
        console.log(err);
      }
    })();
  }, [navigation]);


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

  const [refreshing, setRefresing] = useState(false);



  const newLocation = async (value) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    setLoading(true);
    setLocation(value);
    await AsyncStorage.setItem("location", value);
    const phone = await AsyncStorage.getItem("phone");
    const res = await axios.get(domain_web + "/get_catalog",
      {
        params: {
          filter: route.params == undefined ? [] : route.params.filters,
          sorted: route.params == undefined ? 0 : route.params.sorted,
          location: value,
          phone: phone
        }
      }
    );
    if (status == "granted") {
      const col = await Location.getLastKnownPositionAsync();
      setCoords({ latitude: col.coords.latitude, longitude: col.coords.longitude });
      setWashes(WashesSorted(res.data.washer, { latitude: col.coords.latitude, longitude: col.coords.longitude }));
    } else {
      setWashes(res.data.washer.sort(rate_sort));
    }
    setStock(res.data.stock);
    setLoading(false)
  }


  const refresh = async () => {
    setRefresing(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      const location = await AsyncStorage.getItem("location");
      setLocation(location)
      const phone = await AsyncStorage.getItem("phone");
      const res = await axios.get(domain_web + "/get_catalog",
        {
          params: {
            filter: route.params == undefined ? [] : route.params.filters,
            sorted: route.params == undefined ? 0 : route.params.sorted,
            location: location,
            phone: phone
          }
        }
      );
      if (status == "granted") {
        const col = await Location.getLastKnownPositionAsync();
        setCoords({ latitude: col.coords.latitude, longitude: col.coords.longitude });
        setWashes(WashesSorted(res.data.washer, { latitude: col.coords.latitude, longitude: col.coords.longitude }));
      } else {
        setWashes(res.data.washer.sort(rate_sort));
      }
      setStock(res.data.stock);
      const token = await AsyncStorage.getItem("token");
      const cars = await axios.get(domain_mobile + "/api/get_cars", { headers: { "Authorization": "Token " + token } });
      setCountCar(cars.data.length);
      setRefresing(false)
    }
    catch (err) {
      console.log(err);
    }
  }

  const EmptyComponent = () => {
    return (
      <View style={{ marginTop: '5%' }}>
        <Text style={[styles.stocks, { textAlign: 'center' }]}>В данном городе автомоек с такими фильтрами нет</Text>
      </View>
    )
  }

  const renderWashes = ({ item }) => {
    return (<TouchableOpacity onPress={() => selectWasher(item.id, item.sale)} activeOpacity={0.7} style={styles.mt_TouchOpac}>
      <LinearGradient
        colors={['#01010199', '#35343499']}
        start={[0, 1]}
        style={styles.gradient_background} >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Image source={{ uri: domain_web + item.avatar }} style={{ width: '100%', height: '100%', borderRadius:5}} width={'35%'} height={'100%'} resizeMode='center' />
          <View style={{ width:'43%' }}>
            <Text style={styles.stocks}>{item.address}</Text>
            <Text style={styles.text_in_item}>Скидка {item.sale}%</Text>
            <Text style={styles.text_in_item}>{bLocation && "В " + getDistance(coords, { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) }) + " м от вас"}</Text>
          </View>
          <LinearGradient colors={['#FFF73780', '#FFF97480']} start={[1, 0]} style={styles.rating} >
            <Text style={styles.stocks}>{item.rate.count_rate == 0 ? "0.00" : (item.rate.mean_rate / item.rate.count_rate).toFixed(2)}</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </TouchableOpacity>)
  }

  const renderStock = ({ item }) => {
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
      <View style={styles.main}>
        {/* <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
        /> */}
        <Text style={styles.subtext}>местоположение</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setBVeiw(!bView)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '0%' }}>
            <Text style={styles.city}>{location}</Text>
            <Ionicons name='chevron-forward' size={24} style={{ color: '#7CD0D7' }} />
          </View>
        </TouchableOpacity>
        {bView &&
          <Picker
            selectedValue={location}
            itemStyle={{ height: 150 }}
            onValueChange={(value, index) => newLocation(value)}>
            {locations.map(obj => <Picker.Item color='#fff' key={obj} label={obj} value={obj} />)}
          </Picker>}

        <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.stocks}>Акции</Text>
          </View>
          <FlatList
            style={{ height: "15%", marginTop:5 }}
            showsVerticalScrollIndicator={false}
            data={stock}
            keyExtractor={item => item.text}
            renderItem={renderStock}
          />
        </LinearGradient>

        <View style={{ marginBottom: 50 }}>
          {!loading ?
            <FlatList
              style={{ height: "100%" }}
              data={washes}
              keyExtractor={item => item.id}
              refreshing={refreshing}
              onRefresh={refresh}
              renderItem={renderWashes}
              ListEmptyComponent={<EmptyComponent />}
            />
            : <ActivityIndicator />}
        </View>

      </View>
      {/* <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        enablePanDownToClose={false}
        snapPoints={snapPoints}
        // onChange={handleSheetChanges}
      >
        <View style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheet>
    </View> */}
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
    padding: '5%',
  },
  // конец главного контейнера




  subtext: {
    fontSize: 11,
    color: '#CBCBCB',
    fontFamily: 'Raleway_400Regular'
  },



  mt_TouchOpac: {
    marginTop: '5%',
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
    marginTop: '15%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular'
  },
  rating: {
    alignItems:'center',
    width:'17%',
    borderRadius: 5,
    justifyContent: 'center',
    padding: '2%',
  },

})
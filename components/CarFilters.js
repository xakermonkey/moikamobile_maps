import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { CheckBox, Icon } from 'react-native-elements';
import { CheckBox, Icon } from '@rneui/themed';
import axios from 'axios';
import { domain_web } from '../domain';
import { Picker } from '@react-native-picker/picker';
import { CommonActions } from '@react-navigation/native';
import * as Location from "expo-location";
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';


function CarFilters({ navigation, route }) {


  const [filters, setFilters] = useState([]);
  const [sort, setSort] = useState(["Расстояние", "Рейтинг"]);
  const [bSort, setBSort] = useState(false);
  const [selectSort, setSelectSort] = useState();
  const [check, setCheck] = useState([]);
  const [perm, setPerm] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'ФИЛЬТР',
      headerBackTitleVisible: false,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#6E7476',
        // opacity:1,
      },
      headerTintColor: '#fff',
      // headerTitleStyle: {
      //   fontWeight: 'bold',
      fontFamily: 'Raleway_700Bold',
      // },
      headerLeft: () => (
        <TouchableOpacity style={{ left: 0 }} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Ionicons name='close' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      )
    });
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      const service = await Location.hasServicesEnabledAsync();
      setPerm(status === 'granted' && service);
      if (status === 'granted' && service) {
        const sorted = await AsyncStorage.getItem("sorted");
        if (sorted != null) {
          setSelectSort(parseInt(sorted));
        } else {
          setSelectSort(0);
        }
      }else{
        setSort(["Рейтинг"]);
        setSelectSort(0);
      }

      const filters = await AsyncStorage.getItem("filters");
      if (filters != null) {
        setCheck(JSON.parse(filters));
      } else {
        setCheck([]);
      }
      if (status !== 'granted') {
        Alert.alert("Внимание",
          "Для автоматического определения города и отображения расстояния до автомойки необходимо включить определение геопозиции");
      }
      const res = await axios.get(domain_web + "/get_filter");
      setFilters([...res.data, { name: "Безналичный расчет" }, { name: "Наличный расчет" }])
    })();
  }, [navigation])


  const setFilterCheck = (name) => {
    if (check.indexOf(name) == -1) {
      setCheck([...check, name]);
    }
    else {
      const index = check.indexOf(name);
      setCheck([...check.slice(0, index), ...check.slice(index + 1,)]);
    }
  }


  const sendFilters = async () => {
    await AsyncStorage.setItem("sorted", selectSort.toString());
    await AsyncStorage.setItem("filters", JSON.stringify(check));
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'CarWashes'
          },
        ],
      }));
    // navigation.replace("CarWashes", { "sorted": selectSort, "filters": check })
  }


  return (
    <View style={styles.container}>
      <StatusBar />
      <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      {/* <BlurView intensity={100} style={styles.blurContainer}> */}
      <View style={styles.blurContainer}>

        {Platform.OS === 'ios' ?
          <View>
            <LinearGradient
              colors={['#01010199', '#35343499']}
              start={[0, 1]}
              style={styles.gradient_background} >
              <TouchableOpacity activeOpacity={0.7} disabled={!perm} onPress={() => { setBSort(!bSort) }} style={styles.mt_TouchOpac}>
                <View >
                  <Text style={styles.subtext}>сортировка</Text>
                  <Text style={styles.text}>{sort[selectSort]}</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
            {bSort &&
              <View style={{
                position: 'absolute', top: 50, left: 0, right: 0,
                // zIndex: 11,
                backgroundColor: '#6E7476', borderRadius: 5, shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 10,
                },
                shadowOpacity: 0.8,
                shadowRadius: 15,
              }}>
                <Picker
                  selectedValue={selectSort}
                  itemStyle={{ height: 120 }}
                  onValueChange={(value, index) => { setSelectSort(value); setBSort(false); }}>
                  {sort.map((obj, ind) => <Picker.Item color='#fff' key={ind} label={obj} value={ind} />)}
                </Picker>
              </View>
            }</View>
          :
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <Text style={styles.subtext}>сортировка</Text>
            <Picker
              style={{ color: '#fff', marginHorizontal: '-5%', marginBottom: '-5%' }}
              selectedValue={selectSort}
              onValueChange={(value, index) => setSelectSort(value)}>
              {sort.map((obj, ind) => <Picker.Item color='#000' key={ind}  label={obj} value={ind} />)}
            </Picker>
          </LinearGradient>
        }


        <View style={{ zIndex: -1 }}>
          <LinearGradient
            colors={['#01010199', '#35343499']}
            start={[0, 1]}
            style={styles.gradient_background} >
            <View>
              <Text style={styles.subtext}>фильтры</Text>
              {filters.map((obj, id) => {
                return (
                  <View key={id} style={styles.checkbox}>
                    <CheckBox containerStyle={{ padding: 0, margin: 0, marginRight: 0, marginLeft: 0, backgroundColor: null }}
                      checkedIcon={
                        <Icon name="radio-button-checked" type="material" color="#7BCFD6" size={25} />
                      }
                      uncheckedIcon={
                        <Icon name="radio-button-unchecked" type="material" color="#7BCFD6" size={25} />
                      }
                      checked={check.indexOf(obj.name) != -1}
                      onPress={() => setFilterCheck(obj.name)}
                    />
                    <Text style={styles.text_check}>{obj.name}</Text>
                  </View>
                )
              })}
            </View>
          </LinearGradient>


          <TouchableOpacity activeOpacity={0.8} onPress={sendFilters} style={{ marginTop: '5%' }} >
            <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
              <Text style={styles.text_btn} >Ок</Text>
            </ImageBackground>
          </TouchableOpacity>

        </View>

        {/* </BlurView> */}
      </View>
    </View >
  );
}

export default CarFilters
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
    paddingHorizontal: '5%',
    // padding: 20,
    // justifyContent: 'center',
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
  subtext: {
    fontSize: 8,
    color: '#B2B2B2',
    fontFamily: 'Raleway_400Regular',
  },
  text: {
    marginTop: '2%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular',
  },
  text_check: {
    marginLeft: '5%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular',
  },
  checkbox: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: '5%',
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
  // конец кнопки ок
});


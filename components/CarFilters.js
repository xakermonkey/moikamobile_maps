import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CheckBox, Icon } from 'react-native-elements';
import axios from 'axios';
import { domain_web } from '../domain';
import { Picker } from '@react-native-picker/picker';
import { CommonActions } from '@react-navigation/native';
import * as Location from "expo-location";



function CarFilters({ navigation, route }) {


  const [filters, setFilters] = useState([]);
  const [sort, setSort] = useState(["По расстоянию", "По рейтингу"]);
  const [bSort, setBSort] = useState(false);
  const [selectSort, setSelectSort] = useState(route.params.sorted);
  const [check, setCheck] = useState(route.params.filters);
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
        <TouchableOpacity style={{ left: 15 }} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Ionicons name='close' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      )
    });
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setPerm(status === "granted");
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


  const sendFilters = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'CarWashes',
            params: { "sorted": selectSort, "filters": check },
          },
        ],
      }));
    // navigation.replace("CarWashes", { "sorted": selectSort, "filters": check })
  }


  return (
    <View style={styles.container}>
      <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      {/* <BlurView intensity={100} style={styles.blurContainer}> */}
      <View style={styles.blurContainer}>
        {/* <TouchableOpacity onPress={() => navigation.replace('CarWashes', { "sorted": 0, "filters": [] })} activeOpacity={0.7} style={{}}>
          <Ionicons name='close' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.bold_text}>Фильтр</Text>
        </View> */}

        {perm && <View>
          {Platform.OS === 'ios' ?
            <LinearGradient
              colors={['#01010199', '#35343499']}
              start={[0, 1]}
              style={styles.gradient_background} >
              <TouchableOpacity activeOpacity={0.7} onPress={() => { setBSort(!bSort) }} style={styles.mt_TouchOpac}>
                <View >
                  <Text style={styles.subtext}>сортировка</Text>
                  <Text style={styles.text}>{sort[selectSort]}</Text>
                </View>
              </TouchableOpacity>
              {bSort && <Picker
                selectedValue={selectSort}
                onValueChange={(value, index) => setSelectSort(value)}>
                <Picker.Item color='#fff' label="Расстояние" value={0} />
                <Picker.Item label="Рейтинг" color='#fff' value={1} />
              </Picker>}
            </LinearGradient> :

            <LinearGradient
              colors={['#01010199', '#35343499']}
              start={[0, 1]}
              style={styles.gradient_background} >
              <Text style={styles.subtext}>сортировка</Text>
              <Picker
                style={{ color: '#fff', marginHorizontal: '-5%', marginBottom: '-5%' }}
                selectedValue={selectSort}
                onValueChange={(value, index) => setSelectSort(value)}>
                <Picker.Item label="Расстояние" value={0} />
                <Picker.Item label="Рейтинг" value={1} />
              </Picker>
            </LinearGradient>
          }
        </View>}


        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View>
            <Text style={styles.subtext}>фильтры</Text>
            {filters.map((obj, id) => {
              return (
                <View key={id} style={styles.checkbox}>
                  <CheckBox containerStyle={{ padding: 0, margin: 0, marginRight: 0, marginLeft: 0 }}
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


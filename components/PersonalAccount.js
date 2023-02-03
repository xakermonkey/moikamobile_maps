import React, { useState, useLayoutEffect, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Alert, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

function PersonalAccount({ navigation }) {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'ЛИЧНЫЙ КАБИНЕТ',
        // headerShown: false,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#6E7476',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Raleway_700Bold',
        },
        headerLeft: () => (
          <TouchableOpacity style={{left:10}} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.7}>
            <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
            </TouchableOpacity>
        ),
    });
    (async () => {
        setName(await AsyncStorage.getItem("name") == null ? "" : await AsyncStorage.getItem("name"));
        setPhone(await AsyncStorage.getItem("phone") == null ? "" : await AsyncStorage.getItem("phone"));
        setEmail(await AsyncStorage.getItem("email") == null ? "" : await AsyncStorage.getItem("email"));
      })();
  }, [navigation])

  const Logout = async () => {
      await AsyncStorage.multiRemove(await (await AsyncStorage.getAllKeys()).filter(obj => obj != "first_join_app"));
      navigation.dispatch(
        CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }]
        }));
  }

  const DestroyAccount = () => {
    Alert.alert('Информация', 'Заявка на удаление учетной записи отправлена. В течении 24 часов Вы можете отменить данное действие повторной авторизацией')
    Logout()
  }

  return (
    <SafeAreaView style={styles.container} >
      <StatusBar/>
      <View style={styles.main}>

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>имя</Text>
            <Text style={styles.input_text}>{name}</Text>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>телефон</Text>
            {/* <TextInput style={styles.input_text} value={phone} /> */}
            <Text style={styles.input_text}>{phone}</Text>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <Text style={styles.subtext}>email</Text>
            {/* <TextInput style={styles.input_text} value={email} /> */}
            <Text style={styles.input_text}>{email}</Text>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
            <Text style={styles.dc_text}>Личную информацию можно изменить через обратную связь</Text>
          
          </View>
        </LinearGradient>

        <TouchableOpacity onPress={() => navigation.navigate('MyCars')} activeOpacity={0.7} style={[styles.mt_TouchOpac, { marginTop: '20%' }]}>
          <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_btn} >
            <View style={styles.text_with_background}>
              <Text style={styles.btn_text}>Мои авто</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyOrders')} activeOpacity={0.7} style={styles.mt_TouchOpac}>
          <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_btn} >
            <View style={styles.text_with_background}>
              <Text style={styles.btn_text}>Мои Заказы</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => navigation.navigate('MyCards')} activeOpacity={0.7} style={styles.mt_TouchOpac}>
          <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_btn} >
            <View style={styles.text_with_background}>
              <Text style={styles.btn_text}>Мои карты</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity> */}

        <TouchableOpacity activeOpacity={0.8} onPress={Logout} style={[styles.mt_TouchOpac, { marginTop: '10%' }]} >
          <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
            <Text style={styles.text_btn} >Выйти</Text>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={ () => {
          Alert.alert('Внимаение', 'Вы действительно желаете удалить свою учетную запись? Все данные будут безвозвратно удалены!', [{ 'text': 'Нет' }, {
            'text': 'Да', onPress: DestroyAccount,
            style: 'destructive'
          }])
        }} style={{alignSelf:'center', position:'absolute', marginTop: Dimensions.get("window").height * 0.85}} >
            <Text style={styles.dc_text}>Удалить аккаунт</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default PersonalAccount

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6E7476',
    flex: 1,
  },
  main: {
    padding: '5%',
  },
  // конец главного контейнера

  gradient_btn: {
    borderRadius: 5,
    justifyContent: 'center',
    padding: 1,
  },
  // btn_ToucheOpac: {
  //   marginTop: '5%',
  //   borderColor: '#fff',
  //   borderWidth: 1,
  //   borderRadius: 5,
  //   alignItems: 'center',
  // },
  btn_text: {
    fontFamily: 'Montserrat_400Regular',
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
    paddingVertical: '5%',
  },
  text_with_background: {
    alignItems: 'center',
    backgroundColor: '#6E7476',
    borderRadius: 5,
  },
  // конец градиентная кнопка

  gradient_background: {
    padding: '5%',
    // height: '37%',
    borderRadius: 5,
  },
  gradient_line: {
    marginVertical: '4%',
    height: 2,
    borderRadius: 5,
  },
  gradient_background_padding: {
    // padding: '5%',
    // flex: 1
  },
  // конец темный градиентный блок

  subtext: {
    fontSize: 11,
    color: '#CBCBCB',
    fontFamily: 'Montserrat_400Regular'
  },
  input_text: {
    // marginTop: '3%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat_400Regular'
  },
  // конец инпуты в темном градиентном блоке

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
  },
  // мэрджн сверху у всех кнопок

  dc_text: {
    // marginTop: '4%',
    // marginRight: '10%',
    fontSize: 11,
    color: '#B2B2B2',
    fontFamily: 'Raleway_400Regular',
    // textAlign: 'right',
  },
})

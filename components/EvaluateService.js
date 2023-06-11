import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { domain_web } from '../domain';
import { CommonActions } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

function EvaluateService({ navigation, route }) {
  const [check4, setCheck4] = useState(false);

  const [rate, setRate] = useState(1);
  const [text, setText] = useState("");
  const [disable, setDisable] = useState(false);


  const addComment = async () => {
    if (text != "") {
    setDisable(true);
    try {
      const name = await AsyncStorage.getItem("name");
      const res = await axios.post(domain_web + "/add_comment", {
        order: route.params.orderId,
        rate: rate,
        comment: text,
        name: name
      })
      Alert.alert("Успешно", "Спасибо за Ваш отзыв!");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "PersonalAccountScreen" }, { name: "MyOrders" }]
        }));
      } catch (err) {
        setLoading(false);
          Alert.alert("Ошибка", "Что то пошло не так");
          console.log(err);
        }
    } else {
    setDisable(false);
      Alert.alert("Уведомление", "Пожалуйста, оставьте комментарий. Нам важно Ваше мнение");
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar/>
      <Image blurRadius={91} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      {/* <BlurView intensity={100} style={styles.blurContainer}> */}
      <View style={styles.blurContainer}>
        <View style={[styles.row, { justifyContent: 'center', marginTop: '5%', width: "100%" }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('OrderDetails')} activeOpacity={0.7} >
            <Ionicons name='close' size={28} color={'#7CD0D7'} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', flex:9 }}>
            <Text style={styles.bold_text}>Насколько вы довольны{'\n'}качеством обслуживания?</Text>
          </View>
          <View style={{ flex: 1 }}></View>
        </View>
        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setRate(1)} ><FontAwesome name={rate > 0 ? 'star' : 'star-o'} size={28} color={'#FFF737'} style={{ marginRight: '2%' }} /></TouchableOpacity>
            <TouchableOpacity onPress={() => setRate(2)}><FontAwesome name={rate > 1 ? 'star' : 'star-o'} size={28} color={'#FFF737'} style={{ marginRight: '2%' }} /></TouchableOpacity>
            <TouchableOpacity onPress={() => setRate(3)}><FontAwesome name={rate > 2 ? 'star' : 'star-o'} size={28} color={'#FFF737'} style={{ marginRight: '2%' }} /></TouchableOpacity>
            <TouchableOpacity onPress={() => setRate(4)}><FontAwesome name={rate > 3 ? 'star' : 'star-o'} size={28} color={'#FFF737'} style={{ marginRight: '2%' }} /></TouchableOpacity>
            <TouchableOpacity onPress={() => setRate(5)}><FontAwesome name={rate > 4 ? 'star' : 'star-o'} size={28} color={'#FFF737'} style={{ marginRight: '2%' }} /></TouchableOpacity>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background_comment} >

          <TextInput style={styles.text} multiline={true} value={text} onChangeText={setText} placeholder='комментарий' placeholderTextColor={'#B2B2B2'} />
        </LinearGradient>

        <TouchableOpacity activeOpacity={0.8} onPress={addComment} style={{ marginTop: '5%' }} >
          <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
          {disable ? <ActivityIndicator style={{paddingVertical:'5%'}} color="white" /> : <Text style={styles.text_btn} >Ок</Text>}
          </ImageBackground>
        </TouchableOpacity>
        {/* </BlurView> */}
      </View>
    </View>
  );
}

export default EvaluateService
const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
  },

  gradient_background: {
    borderRadius: 5,
  },

  image: {
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    flex: 1,
    padding: '5%',
  },
  bold_text: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Raleway_700Bold',
    textTransform: 'uppercase',
    textAlign:'center'
  },
  gradient_background: {
    marginTop: '5%',
    borderRadius: 5,
    padding: '5%',
    // minHeight:'20%',
  },
  gradient_background_comment: {
    marginTop: '5%',
    borderRadius: 5,
    padding: '5%',
    // minHeight: '20%',
  },
  text: {
    marginTop: '2%',
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular',
    minHeight: '18%',
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
    height:52
  },
  // конец кнопки ок
});


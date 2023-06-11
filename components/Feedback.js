import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_mobile } from '../domain';
import { getPermissionImage } from '../permissions';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';

function Feedback({ navigation }) {


  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [permission, setPermission] = useState();
  const [loading, setLoading] = useState(true);

  const Documents = async () => {
    // console.log(permission);
    if (permission) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        let shir = result.assets[0].uri.split(".");
        shir = shir[shir.length - 1]
        setFile({
          uri: result.assets[0].uri,
          type: 'image/' + shir,
          name: `img.${shir}`
        });
      }
    } else {
      setPermission(await getPermissionImage());
    }
  };

  useEffect((() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => {Keyboard.dismiss(); navigation.dispatch(DrawerActions.openDrawer());}} activeOpacity={0.7}>
          <Ionicons name='chevron-back' size={32} color={'#000'} />
        </TouchableOpacity>
      ),
    });

    (async () => {
      setPermission(await getPermissionImage());
    })();
  }), [navigation])

  const Send = async () => {
    setLoading(false);
    if (text != "") {
      try {
        const token = await AsyncStorage.getItem("token");
        const data = new FormData();
        data.append('text', text);
        data.append("file", file);
        const res = await axios.post(domain_mobile + "/api/support",
          data,
          {
            headers: {
              "Authorization": "Token " + token,
              'Accept': 'application/json',
              "Content-Type": 'multipart/form-data'
            }
          })
        Alert.alert("Уведомление", "Ваше письмо успешно отправлено. Мы обработаем запрос в ближайшее время");
        navigation.replace("MainMenu")
      }
      catch (err) {
        setLoading(true);
        Alert.alert("Ошибка", "Письмо не отправлено");
        console.log(err);
      }
    } else {
      setLoading(true);
      Alert.alert("Уведомление", "Пожалуйста, опишите Вашу проблему");
    }
  }


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <StatusBar />
        <View style={styles.container}>
          {/* <Image blurRadius={100} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' /> */}
          {/* <BlurView intensity={100} style={styles.blurContainer}> */}
          {/* <View style={styles.blurContainer}> */}
          {/* <TouchableOpacity onPress={() => navigation.navigate('OrderDetails')} activeOpacity={0.7} style={{}}>
          <Ionicons name='close' size={28} color={'#7CD0D7'} />
        </TouchableOpacity> */}

          <Text style={styles.bold_text}>При необходимости вы можете{'\n'}прикрепить файл:</Text>

          <View style={styles.row}>
            <LinearGradient
              colors={['#FFF737', '#7BCFD6']}
              start={[0, 1]}
              style={[styles.gradient_background, { width: '50%' }]} >
              <View style={styles.text_with_background}>
                <Text style={styles.file_text}>{file != null ? file.name : "Файл не выбран"}</Text>
              </View>
            </LinearGradient>
            <View style={{ width: 5 }}></View>
            <TouchableOpacity onPress={Documents} activeOpacity={0.7} style={{ width: '50%' }}>
              <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_btn} >
                <View style={styles.text_with_background}>
                  <Text style={styles.btn_text}>Выбрать файл</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>


          <Text style={styles.bold_text}>Подробно опишите проблему</Text>
          <Text style={styles.bold_text}>(когда и при каких условиях произошла):</Text>
          <LinearGradient
            colors={['#FFF737', '#7BCFD6']}
            start={[1, 0]}
            style={styles.gradient_background_comment} >
            <View style={styles.text}>
              <TextInput style={{ width: '97%', paddingVertical: 10, fontSize: 14, height: 100, fontFamily: 'Montserrat_400Regular', color: '#fff', }} value={text} onChangeText={text => setText(text)} multiline={true} textAlignVertical={'top'} placeholder='Описание проблемы' placeholderTextColor={'#B2B2B2'} />
            </View>
          </LinearGradient>

          {!loading ? <ActivityIndicator /> :
            <TouchableOpacity activeOpacity={0.8} onPress={Send} >
              <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
                <Text style={styles.text_btn} >Отправить</Text>
              </ImageBackground>
            </TouchableOpacity>}

          {/* </BlurView> */}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

export default Feedback

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '5%',
    backgroundColor: '#6E7476',
  },

  row: {
    marginVertical: '7%',
    // width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    // alignContent: 'stretch',
    justifyContent: "space-between",
  },


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
    color: '#FFF',
    fontSize: 14,
    textTransform: 'uppercase',
    paddingVertical: '10%',
  },
  text_with_background: {
    alignItems: 'center',
    backgroundColor: '#6E7476',
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
    fontSize: 14,
    color: '#FFF',
    // backgroundColor: '#f2f2f2',
    fontFamily: 'Montserrat_400Regular',
    // textTransform: 'uppercase',
  },
  file_text: {
    fontSize: 14,
    color: '#B5B5B5',
    // backgroundColor: '#f2f2f2',
    paddingVertical: '10%',
    // paddingHorizontal: '11%', //14% ios
    fontFamily: 'Montserrat_400Regular',
    // borderRadius: 5,
    // textTransform: 'uppercase',
  },
  gradient_background: {
    // marginVertical: '2%',
    borderRadius: 5,
    padding: 1,
    // width: '60%',
    // minHeight:'20%',
  },
  gradient_background_comment: {
    marginVertical: '5%',
    borderRadius: 5,
    padding: 1,
    // minHeight: '20%',
  },
  text: {
    // marginTop: '2%',
    backgroundColor: '#6E7476',
    borderRadius: 5,
    alignItems: 'center'
    // minHeight: '10%',
    // paddingBottom: '40%',
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
  // конец кнопки ок
});


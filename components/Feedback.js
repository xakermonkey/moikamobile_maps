import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_mobile } from '../domain';
import { getPermissionImage } from '../permissions';

function Feedback({ navigation }) {


  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [permission, setPermission] = useState();

  const Documents = async () => {
    console.log(permission);
    if (permission) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.cancelled) {
        let shir = result.uri.split(".")
        shir = shir[shir.length - 1]
        setFile({
          uri: result.uri,
          type: 'image/' + shir,
          name: `img.${shir}`
        });
      }
    }else{
      setPermission(await getPermissionImage());
    }
  };

  useEffect((() => {
    (async () => {
      setPermission(await getPermissionImage());
    })();
  }), [navigation])

  const Send = async () => {
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
          }
        })
      navigation.replace("MainMenu")
    }
    catch (err) {
      console.log(err);
    }

  }


  return (
    <View style={styles.container}>
      {/* <Image blurRadius={100} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' /> */}
      {/* <BlurView intensity={100} style={styles.blurContainer}> */}
      {/* <View style={styles.blurContainer}> */}
      {/* <TouchableOpacity onPress={() => navigation.navigate('OrderDetails')} activeOpacity={0.7} style={{}}>
          <Ionicons name='close' size={28} color={'#7CD0D7'} />
        </TouchableOpacity> */}

      <Text style={styles.bold_text}>При необходимости вы можете</Text>
      <Text style={styles.bold_text}>прикрепить файл:</Text>

      <View style={styles.row}>
        <LinearGradient
          colors={['#FFF737', '#7BCFD6']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View style={styles.text_with_background}>
            <Text style={styles.file_text}>{file != null ? file.name : "Файл не выбран"}</Text>
          </View>
        </LinearGradient>

        <TouchableOpacity onPress={Documents} activeOpacity={0.7} style={styles.touch_opac}>
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

        <TextInput style={styles.text} value={text} onChangeText={text => setText(text)} multiline={true} placeholder='Описание проблемы' placeholderTextColor={'#B2B2B2'} />
      </LinearGradient>

      <TouchableOpacity activeOpacity={0.8} onPress={Send} >
        <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
          <Text style={styles.text_btn} >Отправить</Text>
        </ImageBackground>
      </TouchableOpacity>

      {/* </BlurView> */}
    </View>
    // </View>
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

  touch_opac: {
    // width:'50%',
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
    paddingVertical: '5%',
    paddingHorizontal: '5%',
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
    paddingVertical: '5%',
    paddingHorizontal: '11%', //14% ios
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
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#6E7476',
    borderRadius: 5,
    // minHeight: '10%',
    paddingVertical: '20%',
    paddingHorizontal: '5%',
    fontFamily: 'Montserrat_400Regular',
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


import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';




function AddCarInMakingOrder({ navigation }) {
  const [check4, setCheck4] = useState(false);

  return (
    <View style={styles.container}>
      <Image blurRadius={100} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      {/* <BlurView intensity={100} style={styles.blurContainer}> */}
      <View style={styles.blurContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('SelectCar')} activeOpacity={0.7} style={{}}>
        <Ionicons name='chevron-back' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.bold_text}>Добавление авто</Text>
        </View>

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >

          <View style={styles.mt}>
            <Text style={styles.subtext}>тип кузова</Text>
            <View style={styles.row}>
              <Text style={styles.text}>Седан</Text>
              <Ionicons name='chevron-forward' size={24} style={{ color: '#7CD0D7' }} />
            </View>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>

          <View style={styles.mt}>
            <Text style={styles.subtext}>номер автомобиля</Text>
            <TextInput style={styles.text} value={'E111EE 111'} />
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>

        </LinearGradient>

        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('SelectPaymentMethod')} style={{ marginTop: '5%' }} >
          <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
            <Text style={styles.text_btn} >Ок</Text>
          </ImageBackground>
        </TouchableOpacity>

      {/* </BlurView> */}
      </View>
    </View>
  );
}

export default AddCarInMakingOrder
const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    // marginTop:'5%',
  },
  mt: {
    marginTop: 0
  },

  gradient_background: {
    borderRadius: 5,
  },
  gradient_line: {
    marginVertical: '5%',
    height: 2,
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


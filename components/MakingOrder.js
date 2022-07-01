import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons,FontAwesome } from '@expo/vector-icons';




function MakingOrder({ navigation }) {
  const [check4, setCheck4] = useState(false);

  return (
    <View style={styles.container}>
      <Image blurRadius={100} style={[StyleSheet.absoluteFill, styles.image]} source={require('../assets/images/blur_background.png')} resizeMode='cover' />
      {/* <BlurView intensity={100} style={styles.blurContainer}> */}
      <View style={styles.blurContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('PointCarWash')} activeOpacity={0.7} style={{}}>
          <Ionicons name='close' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.bold_text}>Дополнительные параметры</Text>
        </View>

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View >
            <Text style={styles.subtext}>расстояние до вас</Text>
            <Text style={styles.text}>556 м</Text>
          </View>
        </LinearGradient>
        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View >
            <Text style={styles.subtext}>адрес</Text>
            <Text style={styles.text}>г. Краснодар, Ул. Лермонтова</Text>
          </View>
        </LinearGradient>
        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View >
            <Text style={styles.subtext}>реЙтинг</Text>
            <View style={styles.row}>
              <Text style={styles.text}>3.5</Text>
              <FontAwesome name='star' size={28} color={'#FFF737'} />
            </View>
          </View>
        </LinearGradient>

        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('GeneralPriceList')} style={{ marginTop: '5%' }} >
          <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
            <Text style={styles.text_btn} >Прайс-лист</Text>
          </ImageBackground>
        </TouchableOpacity>

      {/* </BlurView> */}
      </View>
    </View>
  );
}

export default MakingOrder
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
    padding: '5%',
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

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'
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
  // конец кнопки
});


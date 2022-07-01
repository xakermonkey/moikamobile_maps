import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, SimpleLineIcons, Fontisto } from '@expo/vector-icons';



function MyCards({ navigation }) {
  return (
    <SafeAreaView style={styles.container} >
      <View style={styles.main}>

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <View style={styles.gradient_background_padding}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
              <Fontisto name='visa' size={28} color={'#7CD0D7'} />
              <Text style={styles.bold_text}>VISA 8765</Text>
              <View style={styles.btn_edit}>
                <TouchableOpacity onPress={() => navigation.navigate('AddEditCard')} activeOpacity={0.7} style={{ marginRight: '5%' }}>
                  <SimpleLineIcons name='pencil' size={28} color={'#7CD0D7'} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name='trash-outline' size={28} color={'#AE0000'} />
                </TouchableOpacity>
              </View>
            </View>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
              <Fontisto name='visa' size={28} color={'#7CD0D7'} />
              <Text style={styles.bold_text}>VISA 8765</Text>
              <View style={styles.btn_edit}>
                <TouchableOpacity onPress={() => navigation.navigate('AddEditCard')} activeOpacity={0.7} style={{ marginRight: '5%' }}>
                  <SimpleLineIcons name='pencil' size={28} color={'#7CD0D7'} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name='trash-outline' size={28} color={'#AE0000'} />
                </TouchableOpacity>
              </View>
            </View>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View style={styles.gradient_background_padding}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
              <Fontisto name='visa' size={28} color={'#7CD0D7'} />
              <Text style={styles.bold_text}>VISA 8765</Text>
              <View style={styles.btn_edit}>
                <TouchableOpacity onPress={() => navigation.navigate('AddEditCard')} activeOpacity={0.7} style={{ marginRight: '5%' }}>
                  <SimpleLineIcons name='pencil' size={28} color={'#7CD0D7'} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name='trash-outline' size={28} color={'#AE0000'} />
                </TouchableOpacity>
              </View>
            </View>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>

        </LinearGradient>

      </View>
    </SafeAreaView>
  );
}

export default MyCards

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6E7476',
    flex: 1,
  },
  main: {
    padding: '5%',
  },
  // конец главного контейнера


  text: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular'
  },
  bold_text: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_700Bold'
  },


  gradient_background: {
    borderRadius: 5,
  },
  gradient_line: {
    marginTop: '5%',
    height: 2,
    borderRadius: 5,
  },
  gradient_background_padding: {
    padding: '5%',
  },
  btn_edit: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
})

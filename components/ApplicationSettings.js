import React, { useState } from "react";
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
// import { ButtonGroup } from 'react-native-elements'
import { ButtonGroup } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';


function ApplicationSettings({ navigation }) {
  const [isEnabled, setIsEnabled] = useState(async () => {
    if (await Notifications.getPermissionsAsync() == 'granted') {
      return true;
    } else {
      return false;
    }
  });

  const toggleSwitch = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus == 'granted') {
      setIsEnabled(true);
    } else {
      await Notifications.requestPermissionsAsync();
      setIsEnabled(false);
    }
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState([0, 2, 3]);

  return (
    <SafeAreaView style={styles.container} >
      <StatusBar/>
      <View showsVerticalScrollIndicator='false' style={styles.main}>



        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >

          <View>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.row}>
                <Text style={styles.item}>Язык приложения</Text>
                <Text style={styles.item_white}>Русский</Text>
                <Ionicons name='chevron-forward' size={28} color={'#7CD0D7'} />
              </View>
            </TouchableOpacity>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View>
              <View style={styles.row}>
                <Text style={styles.item}>Push-уведомления</Text>
                <Switch
                  trackColor={{ false: "#7CD0D7", true: "#7CD0D7" }}
                  thumbColor={isEnabled ? "#6E7476" : "#7CD0D7"}
                  ios_backgroundColor="#6E7476"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
              </View>
            <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
          </View>
          <View>
            <View style={styles.row}>
              <Text style={styles.item}>Тема</Text>
              <ButtonGroup
                buttons={['Авто', 'Светлая', 'Темная']}
                selectedIndex={selectedIndex}
                onPress={(value) => {
                  setSelectedIndex(value);
                }}
                containerStyle={{ width: '80%', borderRadius: 5, height: 28, backgroundColor: '#35343499', borderColor: '#35343499' }}
                textStyle={{ color: '#CBCBCB' }}
                buttonContainerStyle={{backgroundColor:'#35343499'}}
                innerBorderStyle={{color:'#35343499'}}
                buttonStyle={{backgroundColor:'#35343499'}}
                selectedButtonStyle={{backgroundColor:'#7CD0D7', borderRadius:5}}
                selectedTextStyle={{color:'#000000'}}
              />
            </View>
          </View>

        </LinearGradient>


      </View>
    </SafeAreaView>
  );
}

export default ApplicationSettings

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6E7476',
    flex: 1,
  },
  main: {
    padding: '5%',
  },
  // конец главного контейнера

  gradient_background: {
    borderRadius: 5,
    padding: '5%',
  },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginVertical: '7%',
  },


  item: {
    fontSize: 14,
    color: '#CBCBCB',
    fontFamily: 'Raleway_400Regular'
  },
  item_white: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular'
  },
  gradient_line: {
    // marginTop: '7%',
    marginBottom: '5%',
    height: 2,
    borderRadius: 5,
  },

})

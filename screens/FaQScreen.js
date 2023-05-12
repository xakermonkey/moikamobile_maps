import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { domain_web } from "../domain";
import { StatusBar } from 'expo-status-bar';

// const Stack = createStackNavigator();
const Stack = createNativeStackNavigator();

function FaQ({ navigation }) {

  const [faq, setFAQ] = useState([]);
  const [select, setSelect] = useState([]);

  useLayoutEffect(() => {
    axios.get(domain_web + "/get_faq")
      .then(res => {
        setFAQ(res.data);
      })
  }, [navigation]);

  const selectAnswer = (ind) => {
    if (select.indexOf(ind) == -1){
      setSelect([...select, ind])
    }else{
      const index = select.indexOf(ind);
      setSelect([...select.slice(0,index), ...select.slice(index + 1, )])
    }
  }

  const Answer = ({obj, ind}) => {
    return (<View >
      <TouchableOpacity activeOpacity={0.7} onPress={() => selectAnswer(ind)} >
        <View style={styles.row}>
          <Text style={styles.city}>{obj.question}</Text>
          <AntDesign name={select.indexOf(ind) == -1 ? 'plus' : "minus" } size={28} style={{ color: '#7CD0D7', width:'10%' }} />
        </View>
      </TouchableOpacity>
      {select.indexOf(ind) != -1 && <View style={{ marginLeft: "5%", marginHorizontal: "3%" }} ><Text style={styles.city}>{obj.answer}</Text></View>}
      <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
      
    </View>);
  }


  return (
    <SafeAreaView style={styles.container} >
      <StatusBar/>
      <View showsVerticalScrollIndicator='false' style={styles.main}>
        {faq.map((obj, ind) => {
          return (<Answer key={ind} obj={obj} ind={ind} />)
        })}
      </View>
    </SafeAreaView>
  );
}


function FaQScreen({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FaQ" component={FaQ} options={{
        title: 'ТОП ВОПРОСОВ',
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#6E7476',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Raleway_700Bold',
        },
        headerLeft: () => (
          <TouchableOpacity style={{ left:Platform.OS == 'ios' ? 10 : 0 }} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.7} >
            <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
          </TouchableOpacity>
        ),
      }} />
    </Stack.Navigator>
  );
}

export default FaQScreen

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6E7476',
    flex: 1,
  },
  main: {
    padding: '5%',
    marginTop: '10%',
  },
  // конец главного контейнера

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: '5%'
  },

  city: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Raleway_400Regular',
    width:'90%'
  },
  gradient_line: {
    marginTop: '3%',
    marginBottom: '5%',
    height: 2,
    borderRadius: 5,
  },

})

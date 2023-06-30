import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { domain_web } from "../domain";
import { StatusBar } from 'expo-status-bar';
import NetInfo from "@react-native-community/netinfo";
import ErrorNetwork from '../components/ErrorNetwork';
import { Skeleton, SkeletonGroup } from 'react-native-skeleton-loaders'

const Stack = createNativeStackNavigator();

function FaQ({ navigation }) {

  const [faq, setFAQ] = useState([]);
  const [select, setSelect] = useState([]);


  const [networkError, setNetworkError] = useState(false);
  const [titleError, setTitleError] = useState("Пытаемся установить соединение с сервером");
  const [repeatFunc, setRepeatFunc] = useState(null);

  const getDataFromServer = async () => {
    try {
      setTitleError("Пытаемся установить соединение с сервером");
      const res = await axios.get(domain_web + "/get_faq")
      setFAQ(res.data);
      setNetworkError(false);
    } catch {
      setTitleError("Ошибка при получении данных. Проверьте соединение.");
      setRepeatFunc(() => checkInternet);
      setNetworkError(true);
    }

  }
  const checkInternet = async () => {
    setTitleError("Пытаемся установить соединение с сервером");
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setTitleError("Ошибка сети. Проверьте интернет соединение.");
      setRepeatFunc(() => checkInternet)
      setNetworkError(true);
    } else {
      setNetworkError(false);
      getDataFromServer();
    }
  }

  useLayoutEffect(() => {
    checkInternet();
  }, [navigation]);

  const selectAnswer = (ind) => {
    if (select.indexOf(ind) == -1) {
      setSelect([...select, ind])
    } else {
      const index = select.indexOf(ind);
      setSelect([...select.slice(0, index), ...select.slice(index + 1,)])
    }
  }

  const Answer = ({ obj, ind }) => {
    return (<View >
      <TouchableOpacity activeOpacity={0.7} onPress={() => selectAnswer(ind)} >
        <View style={styles.row}>
          <Text style={styles.city}>{obj.question}</Text>
          <AntDesign name={select.indexOf(ind) == -1 ? 'plus' : "minus"} size={28} style={{ color: '#7CD0D7', width: '10%' }} />
        </View>
      </TouchableOpacity>
      {select.indexOf(ind) != -1 && <View style={{ marginLeft: "5%", marginHorizontal: "3%" }} ><Text style={styles.city}>{obj.answer}</Text></View>}
      <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />

    </View>);
  }


  if (networkError) {
    return (
      <ErrorNetwork reconnectServer={repeatFunc} title={titleError} />
    )
  }

  return (
    <SafeAreaView style={styles.container} >
      <StatusBar />
      {select != [] ? <View showsVerticalScrollIndicator='false' style={styles.main}>
        {faq.map((obj, ind) => {
          return (<Answer key={ind} obj={obj} ind={ind} />)
        })}
      </View> : 
      <View style={{paddingHorizontal: '5%'}}>
      <SkeletonGroup numberOfItems={50} direction="column" stagger={{ delay: 1 }}>
        <Skeleton color='#7C8183' w={'100%'} h={50} />
      </SkeletonGroup>
    </View>}
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
          <TouchableOpacity style={{ left: Platform.OS == 'ios' ? 0 : 0 }} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.7} >
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
    width: '90%'
  },
  gradient_line: {
    marginTop: '3%',
    marginBottom: '5%',
    height: 2,
    borderRadius: 5,
  },

})

import React, { useState, useLayoutEffect, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity, ImageBackground, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, SimpleLineIcons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_mobile } from '../domain';
import { StatusBar } from 'expo-status-bar';
import { Skeleton, SkeletonGroup } from 'react-native-skeleton-loaders'
import NetInfo from "@react-native-community/netinfo";
import ErrorNetwork from '../components/ErrorNetwork';

function MyCars({ navigation }) {

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true)

  const [networkError, setNetworkError] = useState(false);
  const [titleError, setTitleError] = useState("Пытаемся установить соединение с сервером");
  const [repeatFunc, setRepeatFunc] = useState(null);


  const getDataFromServer = async () => {
    try {
      setTitleError("Пытаемся установить соединение с сервером");
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(domain_mobile + "/api/get_cars", { headers: { "authorization": "Token " + token } });
      setTitleError("Успешно!");
      setCars(res.data);
      setNetworkError(false);
    } catch {
      setTitleError("Ошибка при получении данных. Проверьте соединение.");
      setRepeatFunc(() => checkInternet);
      setNetworkError(true);
      return;
    }
  }

  const checkInternet = async () => {
    setTitleError("Пытаемся установить соединение с сервером");
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setTitleError("Ошибка сети. Проверьте интернет соединение.");
      setNetworkError(true);
      setRepeatFunc(() => checkInternet);
    } else {
      setNetworkError(false);
      getDataFromServer();
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'МОИ АВТО',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#6E7476',
      },
      headerTitleStyle: {
        color: '#fff',
        textTransform: 'uppercase',
      },
      headerLeft: () => (
        <TouchableOpacity style={{ left: Platform.OS == 'ios' ? 0 : 0 }} onPress={() => navigation.navigate("PersonalAccountScreen")} activeOpacity={0.7}>
          <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ right: Platform.OS == 'ios' ? 0 : 0 }} onPress={() => navigation.navigate('AddEditCar', { "body": "", "number": "", "id": null, "title": "Добавление авто" })} activeOpacity={0.7}>
          <AntDesign name='pluscircleo' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      ),
    });
    (async () => {
      await checkInternet();
      setLoading(false);
    })();
  }, [navigation])

  const deleteCar = async (obj) => {
    setTitleError("Пытаемся установить соединение с сервером");
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setTitleError("Ошибка сети. Проверьте интернет соединение.");
      setNetworkError(true);
      setRepeatFunc(() => deleteCar);
    } else {
      try {
        const token = await AsyncStorage.getItem("token");
        await axios.post(domain_mobile + "/api/delete_cars", { "id": obj.id },
          {
            headers: {
              "Authorization": "Token " + token
            }
          });
        setTitleError("Успешно!");
        const _cars = await AsyncStorage.getItem("cars");
        await AsyncStorage.setItem("cars", (parseFloat(_cars) - 1).toString());
        const carIndex = cars.indexOf(obj);
        setCars([...cars.slice(0, carIndex), ...cars.slice(carIndex + 1,)]);
      } catch (err) {
        setTitleError("Ошибка при удалении машины. Проверьте соединение.");
        setRepeatFunc(() => deleteCar);
        setNetworkError(true);
      }
    }

  }

  const carView = ({ item }) => {
    return (
      <View style={styles.gradient_background_padding}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
          <Text style={[styles.text, { width: '30%' }]}>{item.body}</Text>
          <Text style={[styles.bold_text, { width: '30%' }]}>{item.number}</Text>
          <View style={styles.btn_edit}>
            <TouchableOpacity onPress={() => navigation.navigate('AddEditCar', { "body": item.body, "number": item.number, "id": item.id, "title": "Редактирование авто" })} activeOpacity={0.7} style={{ marginRight: '5%' }}>
              <SimpleLineIcons name='pencil' size={28} color={'#7CD0D7'} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => deleteCar(item)}>
              <Ionicons name='trash-outline' size={28} color={'#AE0000'} />
            </TouchableOpacity>
          </View>
        </View>
        <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_line} />
      </View>)
  }

  const EmptyComponent = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Montserrat_700Bold', textTransform: 'uppercase', fontSize: 18, padding: '5%', color: '#fff' }}>Нет машин</Text>
      </View>
    )
  }


  if (networkError) {
    return (
      <ErrorNetwork reconnectServer={repeatFunc} title={titleError} />
    )
  }


  if (loading) {
    return (<View style={styles.container}>
      <View style={styles.main}>
        <SkeletonGroup numberOfItems={3} direction="column" stagger={{ delay: 1 }}>
          <Skeleton color='#7C8183' w={'100%'} h={80} />
        </SkeletonGroup>
      </View>
    </View>)
  }
  return (
    <SafeAreaView style={styles.container} >
      <StatusBar />
      <View style={styles.main}>

        <LinearGradient
          colors={['#01010199', '#35343499']}
          start={[0, 1]}
          style={styles.gradient_background} >
          <FlatList
            data={cars}
            ListEmptyComponent={<EmptyComponent />}
            keyExtractor={item => item.id}
            renderItem={carView}
          />
        </LinearGradient>

      </View>
    </SafeAreaView>
  );
}

export default MyCars

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
    fontFamily: 'Montserrat_400Regular'
  },
  bold_text: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat_700Bold'
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

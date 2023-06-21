import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useLayoutEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_web } from '../domain';
import { FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Skeleton, SkeletonGroup } from 'react-native-skeleton-loaders'
import NetInfo from "@react-native-community/netinfo";
import ErrorNetwork from '../components/ErrorNetwork';

function MyOrders({ navigation }) {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true)

  const [networkError, setNetworkError] = useState(false);
  const [titleError, setTitleError] = useState("Пытаемся установить соединение с сервером");
  const [repeatFunc, setRepeatFunc] = useState(null);


  const getDataFromServer = async () => {
    try {
      setTitleError("Пытаемся установить соединение с сервером");
      const phone = await AsyncStorage.getItem("phone");
      const res = await axios.get(domain_web + "/get_orders", {
        params: {
          phone: phone
        }
      })
      console.log(res.data);
      setOrders(res.data);
      setLoading(false);
      setNetworkError(false);
    } catch {
      setTitleError("Ошибка при получении данных. Проверьте соединение.");
      setRepeatFunc(checkInternet);
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
      setRepeatFunc(checkInternet);
    } else {
      setNetworkError(false);
      getDataFromServer();
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'МОИ ЗАКАЗЫ',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#6E7476',
      },
      headerTitleStyle: {
        color: '#fff',
        textTransform: 'uppercase',
      },
      headerLeft: () => (
        <TouchableOpacity style={{ left: Platform.OS == 'ios' ? 0 : 0 }} onPress={() => navigation.navigate('PersonalAccountScreen')} activeOpacity={0.7}>
          <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ right: Platform.OS == 'ios' ? 0 : 0 }} onPress={() => navigation.navigate('Catalog')} activeOpacity={0.7}>
          <AntDesign name='pluscircleo' size={28} color={'#7CD0D7'} />
        </TouchableOpacity>
      ),
    });
    (async () => {
      await checkInternet();
    })();
  }, [navigation])

  const EmptyComponent = () => {
    return (
      <View style={{ marginTop: '10%' }}>
        <Text style={{ textAlign: 'center', textTransform: 'uppercase', color: '#fff', fontFamily: 'Montserrat_700Bold' }}>У вас еще нет заказов</Text>
      </View>
    )
  }


  const orderRender = ({ item }) => {
    return (<TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })} activeOpacity={0.7} style={styles.mb_TouchOpac}>
      <LinearGradient
        colors={['#01010199', '#35343499']}
        start={[0, 1]}
        style={styles.gradient_background} >
        <View style={styles.gradient_background_padding}>
          <View style={styles.view_row_between}>
            <View>
              <View style={styles.view_row}>
                <Text style={styles.bold_text}>ЗАКАЗ № </Text>
                <Text style={styles.bold_text}>{item.id}</Text>
              </View>
              <View style={{ marginTop: '4%' }}>
                <View style={styles.sub_view_row}>
                  <Text style={styles.text}>Дата записи:   </Text>
                  <Text style={styles.text_white}>{item.hour}:{item.minute.length == 2 ? item.minute : "0" + item.minute} {item.day.length == 2 ? item.day : "0" + item.day}.{item.mounth.length == 2 ? item.mounth : "0" + item.mounth}.{item.year}</Text>
                </View>
                <View style={styles.sub_view_row}>
                  <Text style={styles.text}>Автомобиль:   </Text>
                  <Text style={styles.text_white}>{item.car.name} {item.number}</Text>
                </View>
                <View style={styles.sub_view_row}>
                  <Text style={styles.text}>Статус:   </Text>
                  <Text style={styles.text_white}>{item.status}</Text>
                </View>
              </View>
            </View>
            <Ionicons name='chevron-forward' size={28} color={'#7CD0D7'} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>)
  }

  if (networkError) {
    return (
      <ErrorNetwork reconnectServer={repeatFunc} title={titleError} />
    )
  }

  if (loading) {
    return (<View style={styles.container}>
      <View style={styles.main}>
        <SkeletonGroup numberOfItems={5} direction="column" stagger={{ delay: 1 }}>
          <Skeleton color='#7C8183' w={'100%'} h={150} />
        </SkeletonGroup>
      </View>
    </View>)
  }
  return (
    <SafeAreaView style={styles.container} >
      <StatusBar />
      <View style={styles.main}>
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={orderRender}
          ListEmptyComponent={<EmptyComponent />}
          showsVerticalScrollIndicator={false}
        />

      </View>
    </SafeAreaView>
  );
}

export default MyOrders

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
  },

  gradient_background_padding: {
    padding: '5%',
  },


  view_row: {
    flexDirection: 'row', alignItems: 'center',
  },
  sub_view_row: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: '3%'
  },
  view_row_between: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 14,
    color: '#CBCBCB',
    fontFamily: 'Montserrat_400Regular'
  },
  text_white: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Montserrat_400Regular'
  },
  bold_text: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Montserrat_700Bold'
  },

  mb_TouchOpac: {
    marginBottom: '5%',
  },
  // мэрджн снизу у всех кнопок

})

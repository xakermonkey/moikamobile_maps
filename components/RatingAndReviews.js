import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { useLayoutEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { domain_web } from '../domain';
import { FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Skeleton, SkeletonGroup } from 'react-native-skeleton-loaders'


function RatingAndReviews({ navigation }) {

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true)
  const [rate, setRate] = useState(1);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'РЕЙТИНГ И ОТЗЫВЫ',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#6E7476',
        },
        headerTitleStyle: {
          color: '#fff',
          textTransform: 'uppercase',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
            </TouchableOpacity>
        ),
    });
    (async () => {
      const washer = await AsyncStorage.getItem("washer")
      const res = await axios.get(domain_web + "/get_washes_rating", {
        params: {
          washes: washer
        }
      });
      console.log(res.data);
      setComments(res.data);
      setLoading(false);
    })();
      setLoading(false);

  }, [navigation])

  const EmptyComponent = () => {
    return (
      <View style={{ marginTop:'10%' }}>
        <Text style={{ textAlign: 'center', textTransform:'uppercase', color:'#fff', fontFamily:'Montserrat_700Bold' }}>У этой мойки еще нет отзывов</Text>
      </View>
    )
  }


  const commentsRender = ({ item }) => {
    return (
      <LinearGradient
        colors={['#01010199', '#35343499']}
        start={[0, 1]}
        style={styles.gradient_background} >
        <View style={styles.gradient_background_padding}>
          <View style={styles.view_row_between}>
            <View>
                <Text style={styles.bold_text}>{item.name}</Text>
              <View style={{ marginTop: '4%' }}>
                  <Text style={styles.text_white}>{item.order.comment}</Text>
              </View>
            </View>
            
            <View style={styles.view_row}>
          <FontAwesome name={'star'} size={18} color={item.rate > 0 ? '#FFF737': '#7C8183'} style={{ marginRight: '2%' }} />
          <FontAwesome name={'star'} size={18} color={item.rate > 1 ? '#FFF737': '#7C8183'} style={{ marginRight: '2%' }} />
          <FontAwesome name={'star'} size={18} color={item.rate > 2 ? '#FFF737': '#7C8183'} style={{ marginRight: '2%' }} />
          <FontAwesome name={'star'} size={18} color={item.rate > 3 ? '#FFF737': '#7C8183'} style={{ marginRight: '2%' }} />
          <FontAwesome name={'star'} size={18} color={item.rate > 4 ? '#FFF737': '#7C8183'} style={{ marginRight: '2%' }} />
          </View>
          </View>
        </View>
      </LinearGradient>
      )
  }

  if (loading){
    return(<View style={styles.container}>
      <View style={styles.main}>
      <SkeletonGroup numberOfItems={5} direction="column" stagger={{ delay: 1 }}>
            <Skeleton color='#7C8183' w={'100%'} h={150} />
      </SkeletonGroup>
      </View>
      </View>)
  }
  return (
    <SafeAreaView style={styles.container} >
      <StatusBar/>
      <View style={styles.main}>
      <FlatList 
        data={comments}
        keyExtractor={item => item.id}
        renderItem={commentsRender}
        ListEmptyComponent={<EmptyComponent />}
        showsVerticalScrollIndicator={false}
        />

      </View>
    </SafeAreaView>
  );
}

export default RatingAndReviews

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
    marginBottom: '5%',
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

import React, { useLayoutEffect, useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { DrawerContentScrollView, DrawerItem, createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons, FontAwesome, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';


const Drawer = createDrawerNavigator();

export function DrawerContent(props) {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useLayoutEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem("token");
            if (token != null) {
                setIsAuthenticated(true);
            }
        })();
    }, [props.navigation])

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar/>
            {/* <DrawerContentScrollView {...props}> */}

                <View style={styles.row}>
                    <TouchableOpacity onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())} activeOpacity={0.7} style={{}}>
                        <Ionicons name='close' size={28} color={'#7CD0D7'} />
                    </TouchableOpacity>
                    {/* <Image style={styles.img} source={require('../assets/images/logo_menu.png')} /> */}
                </View>

                <DrawerItem
                    icon={({ color, size }) => (
                      <View style={{width:24}}>
                        <MaterialIcons name='subscriptions' size={24} color={'#7CD0D7'} />
                        </View>
                    )}
                    style={styles.mt}
                    label="Хочу помыть"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => { props.navigation.navigate('MakingOrderModal') }}
                />
                <DrawerItem
                    icon={({ color, size }) => (
                      <View style={{width:24}}>
                        <FontAwesome5 name='map-marker-alt' size={24} color={'#7CD0D7'} />
                        </View>
                    )}
                    style={styles.mt}
                    label="Проложить маршрут"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => { 
                        props.navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: "Map" }]
                            }));
                    }}
                />
                <DrawerItem
                    icon={({ color, size }) => (
                      <View style={{width:24}}>
                        <FontAwesome name='star' size={24} color={'#7CD0D7'} />
                        </View>
                    )}
                    style={styles.mt}
                    label="Рейтинг и отзывы"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => { props.navigation.navigate('RatingAndReviews') }}
                />
                <DrawerItem
                    icon={({ color, size }) => (
                      <View style={{width:24}}>
                        {/* <FontAwesome name='star' size={24} color={'#7CD0D7'} /> */}
                        </View>
                    )}
                    style={styles.mt}
                    label={'Тел.: 4345543345'}
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => { Linking.openURL('tel:' + '4345543345') }}
                />

            {/* </DrawerContentScrollView> */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',
        // padding: '9%'
        marginLeft: '10%',
    },
    img: {
        marginLeft: '8%'
    },
    mt: {
        marginTop: '7%',
        marginLeft: '10%',
    },

});
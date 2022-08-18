import React, { useLayoutEffect, useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItem, createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons, FontAwesome, AntDesign, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
// import { StatusBar } from 'expo-status-bar';


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
            {/* <StatusBar/> */}
            <DrawerContentScrollView {...props}>

                <View style={styles.row}>
                    <TouchableOpacity onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())} activeOpacity={0.7} style={{}}>
                        <Ionicons name='close' size={28} color={'#7CD0D7'} />
                    </TouchableOpacity>
                    <Image style={styles.img} source={require('../assets/images/logo_menu.png')} />
                </View>

                <DrawerItem
                    icon={({ color, size }) => (
                        <FontAwesome5 name='map-marker-alt' size={24} color={'#7CD0D7'} />
                    )}
                    style={styles.mt}
                    label=" Карта"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => { 
                        props.navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: "Map" }]
                            }));
                        // props.navigation.navigate('Map') 
                    }}
                />
                <DrawerItem
                    icon={({ color, size }) => (
                        <FontAwesome5 name='question' size={24} color={'#7CD0D7'} />
                    )}
                    style={styles.mt}
                    label=" Как это работает?"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => { props.navigation.navigate('HowItWorks') }}
                />
                <DrawerItem
                    icon={({ color, size }) => (
                        <Feather name='message-square' size={24} color={'#7CD0D7'} />
                    )}
                    style={styles.mt}
                    label="FAQ"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => { props.navigation.navigate('AnsQues') }}
                />
                <DrawerItem
                    icon={({ color, size }) => (
                        <MaterialIcons name='subscriptions' size={24} color={'#7CD0D7'} />
                    )}
                    style={styles.mt}
                    label="Каталог"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => { props.navigation.navigate('Catalog') }}
                />
                <DrawerItem
                    icon={({ color, size }) => (
                        <Ionicons name='person-outline' size={24} color={'#7CD0D7'} />
                    )}
                    style={styles.mt}
                    label="Личный кабинет"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => {
                        if (isAuthenticated) {
                            props.navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: "PersonalAccount" }]
                                }));
                            // props.navigation.navigate('PersonalAccount') 
                        } else {
                            Alert.alert('Внимаение', 'Вы не авторизованы', [{ 'text': 'Ок' }, {
                                'text': 'Войти', onPress: async () => {
                                    await AsyncStorage.multiRemove(await AsyncStorage.getAllKeys());
                                    props.navigation.dispatch(
                                        CommonActions.reset({
                                            index: 0,
                                            routes: [{ name: "Login" }]
                                        }));
                                }
                            }])
                        }
                    }}
                />
                <DrawerItem
                    icon={({ color, size }) => (
                        <FontAwesome5 name='envelope-open' size={24} color={'#7CD0D7'} />
                    )}
                    style={styles.mt}
                    label="Обратная связь"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => {
                        if (isAuthenticated) { props.navigation.navigate('Feedback') } else {
                            Alert.alert('Внимаение', 'Вы не авторизованы', [{ 'text': 'Ок' }, {
                                'text': 'Войти', onPress: async () => {
                                    await AsyncStorage.multiRemove(await AsyncStorage.getAllKeys());
                                    props.navigation.dispatch(
                                        CommonActions.reset({
                                            index: 0,
                                            routes: [{ name: "Login" }]
                                        }));
                                }
                            }])
                        }
                    }}
                />
                <DrawerItem
                    icon={({ color, size }) => (
                        <Ionicons name='settings-outline' size={24} color={'#7CD0D7'} />
                    )}
                    style={styles.mt}
                    label="Настройки приложения"
                    labelStyle={{ color: '#fff', fontSize: 14, fontFamily: 'Raleway_400Regular', textTransform: 'uppercase' }}
                    onPress={() => { props.navigation.navigate('ApplicationSettings') }}
                />

            </DrawerContentScrollView>
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
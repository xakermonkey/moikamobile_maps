import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Platform, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { domain_mobile, domain_web } from '../domain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaskInput from 'react-native-mask-input';
import { Picker } from '@react-native-picker/picker';
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from 'expo-status-bar';

function LoginScreen({ navigation }) {

    const [regions, setRegions] = useState(null);

    const [selectReg, setSelectReg] = useState(0)
    const [num, setNum] = useState("");

    const [disable, setDisable] = useState(false);

    const [bReg, setBReg] = useState(false);

    const [mask, setMask] = useState(['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]);


    useLayoutEffect(() => {
        (async () => {
            // await AsyncStorage.removeItem("token");
            // await AsyncStorage.removeItem("first_join_app");
            const token = await AsyncStorage.getItem("token");
            // let lastStock = await AsyncStorage.getAllKeys()
            // lastStock = lastStock.filter(key => key.startsWith("stock_"))
            // let lastServise = await AsyncStorage.getAllKeys()
            // lastServise = lastServise.filter(key => key.startsWith("servise_"))
            // for (let i = 0; i<lastStock.length; i++){
            //     await AsyncStorage.removeItem(lastStock[i]);
            // }
            // for (let i = 0; i<lastServise.length; i++){
            //     await AsyncStorage.removeItem(lastServise[i]);
            // }
            if (token != null) {
                navigation.replace("MainMenu");
                return;
            }
            const res = await axios.get(domain_web + "/get_code_region");
            // console.log(res);
            setRegions(res.data);
            setSelectReg(0)

            await SplashScreen.hideAsync();
            const first_join_app = await AsyncStorage.getItem("first_join_app");
            if (first_join_app == null) {
                navigation.navigate("how_it_works");
            }
        })()

    }, [navigation])

    // useEffect(() => {
    //     (async () => {
    //         await SplashScreen.hideAsync();
    //         const first_join_app = await AsyncStorage.getItem("first_join_app");
    //         console.warn('dd')
    //         if (first_join_app == null) {
    //             navigation.navigate("how_it_works");
    //         }
    //     })
    // }, [navigation])


    const setCode = async () => {
        setDisable(true);
        if (num.length < 14) {
            Alert.alert('Внимание', 'Неверный формат номера телефона');
            setDisable(false);
        } else {
            const res = await axios.post(domain_mobile + "/api/login", { "number": regions[selectReg].code + num });
            navigation.navigate('VerificationCode', { "number": regions[selectReg].code + num });
            setDisable(false);
        }
    }


    if (regions == null) {
        return (
            <View style={styles.container}>
                <StatusBar />
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, padding: '5%' }}>
                    <Image source={require('../assets/images/logo_succes.png')} />
                    <Text style={[styles.bold_text, { textAlign: 'center' }]}>Пытаемся установить соединение с сервером</Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container} >
            <StatusBar />
            <ScrollView style={styles.main}>

                <View style={styles.logo}>
                    <Image source={require('../assets/images/logo.png')} />
                </View>

                <View style={styles.mt} >
                    {Platform.OS === 'ios' ? <LinearGradient colors={['#7BCFD6', '#FFF737']} start={[1, 0]} style={styles.gradient_btn} >
                        <View style={styles.text_with_background}>

                            <TouchableOpacity onPress={() => setBReg(!bReg)} activeOpacity={0.7} >
                                <Text style={styles.subtext}>страна</Text>
                                <View style={styles.row}>
                                    <Text style={styles.text}>{regions[selectReg].country}</Text>
                                    <Ionicons name='chevron-forward' size={24} style={{ color: '#7CD0D7' }} />
                                </View>
                            </TouchableOpacity>
                            {bReg &&
                                <Picker
                                    selectedValue={selectReg}
                                    itemStyle={{ height: 150 }}
                                    onValueChange={(value, index) => setSelectReg(index)}>
                                    {regions.map((obj, ind) => <Picker.Item color='#fff' key={obj.code} label={obj.country} value={ind} />)}
                                </Picker>
                            }
                        </View>
                    </LinearGradient> :

                        <LinearGradient colors={['#7BCFD6', '#FFF737']} start={[1, 0]} style={styles.gradient_btn} >
                            <View style={styles.text_with_background_android}>
                                <Text style={styles.subtext_android}>страна</Text>
                                <Picker
                                    // mode='dropdown'
                                    selectedValue={selectReg}
                                    itemStyle={{}}
                                    style={{ color: '#fff', }}
                                    onValueChange={(value, index) => setSelectReg(index)}>
                                    {regions.map((obj, ind) => <Picker.Item key={obj.code} label={obj.country} value={ind} />)}
                                </Picker>

                            </View>
                        </LinearGradient>
                    }
                </View>


                <LinearGradient colors={['#FFF737', '#7BCFD6']} start={[1, 0]} style={styles.gradient_btn} >
                    <View style={styles.phone_background}>
                        <Text style={styles.subtext}>ваш номер телефона</Text>
                        <View style={{ flexDirection: 'row' }} >
                            <View style={{ marginTop: "2%" }} ><Text style={styles.input}>{regions[selectReg].code}</Text></View>
                            <MaskInput mask={mask} style={styles.input} value={num} keyboardType="numeric" onChangeText={((masked, unmasked) => setNum(masked))} />
                        </View>
                    </View>
                </LinearGradient>


                <TouchableOpacity activeOpacity={0.8} onPress={setCode} disabled={disable} style={styles.mt} >
                    <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
                        <Text style={styles.text_btn} >Ок</Text>
                    </ImageBackground>
                </TouchableOpacity>


                <LinearGradient
                    colors={['#01010199', '#35343499']}
                    start={[0, 1]}
                    style={styles.gradient_background} >
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styles.text_gray}>Нажимая «ОК», Вы соглашаетесь</Text>
                            <TouchableOpacity activeOpacity={0.9} onPress={() => Linking.openURL('https://time4ycar.ru/ru/contract')}>
                                <Text style={[styles.text_gray, { fontFamily: 'Raleway_700Bold' }]}>с Политикой и условиями</Text>
                            </TouchableOpacity>
                            <Text style={styles.text_gray}>использования сервиса</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('MainMenu')} style={styles.mt} >
                            <Text style={{ color: '#7CD0D7', fontSize: 11 }}>пропустить</Text>

                        </TouchableOpacity>
                    </View>
                </LinearGradient>
                <TouchableOpacity onPress={() => navigation.navigate('how_it_works')} activeOpacity={0.7} style={{ marginVertical: '10%' }}>
                    {/* margin: '30%' iphone */}
                    <LinearGradient colors={['#00266F', '#7BCFD6']} start={[1, 0]} style={styles.gradient_btn_how} >
                        <View style={styles.text_with_background_how}>
                            <Text style={styles.btn_text}>Как это работает?</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    )
}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#6E7476',
        flex: 1,
    },
    main: {
        padding: '5%',
    },


    logo: {
        marginTop: '10%',
        alignItems: 'center',
    },


    subtext: {
        fontSize: 11,
        color: '#CBCBCB',
        fontFamily: 'Raleway_400Regular'
    },
    subtext_android: {
        marginLeft: '5%',
        marginTop: '2%',
        fontSize: 11,
        color: '#CBCBCB',
        fontFamily: 'Raleway_400Regular'
    },


    input: {
        marginTop: '2%',
        marginLeft: "1%",
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Raleway_400Regular',
        width: '100%'
    },


    text_gray: {
        fontSize: 14,
        color: '#A0A0A0',
        fontFamily: 'Raleway_400Regular'
    },
    text: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Raleway_400Regular'
    },


    gradient_btn_how: {
        borderRadius: 5,
        justifyContent: 'center',
        padding: 1,
    },
    btn_text: {
        fontFamily: 'Raleway_400Regular',
        color: '#fff',
        fontSize: 14,
        textTransform: 'uppercase',
        paddingVertical: '5%',
    },
    text_with_background_how: {
        alignItems: 'center',
        backgroundColor: '#6E7476',
        borderRadius: 5,
    },

    gradient_btn: {
        marginTop: '5%',
        borderRadius: 5,
        justifyContent: 'center',
        padding: 1,
    },

    text_with_background: {
        paddingHorizontal: '5%',
        paddingVertical: '2%',
        // alignItems: 'center',
        backgroundColor: '#6E7476',
        borderRadius: 5,
    },
    text_with_background_android: {
        // paddingLeft: '5%',
        // paddingTop: '2%',
        // alignItems: 'center',
        backgroundColor: '#6E7476',
        borderRadius: 5,
    },

    phone_background: {
        paddingHorizontal: '5%',
        paddingVertical: '3%',
        // alignItems: 'center',
        backgroundColor: '#6E7476',
        borderRadius: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '2%',
    },
    mt: {
        marginTop: '5%'
    },
    gradient_background: {
        marginTop: '5%',
        borderRadius: 5,
        padding: '5%',
        // marginBottom: '20%',
    },
    bold_text: {
        marginTop: '5%',
        fontSize: 18,
        color: '#fff',
        fontFamily: 'Raleway_700Bold',
        textTransform: 'uppercase',
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


})

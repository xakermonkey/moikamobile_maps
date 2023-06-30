import React, { useLayoutEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, ImageBackground, Alert, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { domain_mobile, domain_web } from "../domain";
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { validate } from 'react-email-validator';
import { StatusBar } from 'expo-status-bar';
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import ErrorNetwork from '../components/ErrorNetwork';

function DataScreen({ navigation }) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("Краснодар");
    const [country, setCountry] = useState([]);
    const [bView, setBView] = useState(false);
    const [disable, setDisable] = useState(false);


    const [networkError, setNetworkError] = useState(false);
    const [titleError, setTitleError] = useState("Пытаемся установить соединение с сервером");
    const [repeatFunc, setRepeatFunc] = useState(null);

    const getDataFromServer = async () => {
        const first_name = await AsyncStorage.getItem("name");
        const email = await AsyncStorage.getItem("email");
        const location = await AsyncStorage.getItem("location");
        try {
            setTitleError("Пытаемся установить соединение с сервером");
            const ret = await axios.get(domain_web + "/get_country");
            // console.warn(ret);
            setCountry(ret.data.country);
            setName(first_name);
            setEmail(email);
            if (location != null) {
                setLocation(location);
            }
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
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log("Not location");
            }
            await checkInternet();
        })();
    }, [navigation])


    const getLocation = async () => {
        const permiss = await Location.requestForegroundPermissionsAsync();
        const service = await Location.hasServicesEnabledAsync();
        if (permiss.status == 'granted' && service) {
            let location = await Location.getLastKnownPositionAsync();
            if (location != null) {
                let geocod = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
                if (country.indexOf(geocod[0].city) != -1){
                    setLocation(geocod[0].city)
                }else{
                    Alert.alert("Упс...", "К сожалению, наш сервис пока не работает в вашем городе. Но Вы можете всегда им воспользоваться в любом городе из списка")
                    setLocation(country[0]);
                }

            }
        } else {
            Alert.alert("Внимание", "Необходимо включить определение геопозиции");
            return;
        }
    }


    const sendData = async () => {
        setDisable(true);
        setTitleError("Пытаемся установить соединение с сервером");
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            setTitleError("Ошибка сети. Проверьте интернет соединение.");
            setRepeatFunc(() => sendData)
            setNetworkError(true);
        } else {

            if (validate(email) || email === "") {
                const token = await AsyncStorage.getItem('token');
                try {
                    const res = await axios.post(domain_mobile + "/api/send_user_info",
                        {
                            'name': name,
                            'email': email,
                            'location': location
                        },
                        {
                            headers: {
                                "Authorization": "Token " + token
                            }
                        })
                    await AsyncStorage.setItem("location", location);
                    await AsyncStorage.setItem("name", name);
                    await AsyncStorage.setItem("email", email);
                    await AsyncStorage.setItem("cars", res.data.cars.toString());
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "MainMenu" }]
                        }));
                }
                catch (err) {
                    setTitleError("Ошибка при отправке данных. Проверьте интернет соединение.");
                    setRepeatFunc(() => sendData)
                    setNetworkError(true);
                }
            } else {
                Alert.alert("Ошибка", "Введен неверный формат почты");
                setDisable(false);
            }

        }
        setDisable(false);

    }

    if (networkError) {
        return (
            <ErrorNetwork reconnectServer={repeatFunc} title={titleError} />
        )
    }


    return (
        <SafeAreaView style={styles.container} >
            <StatusBar />
            <View style={styles.main}>

                <LinearGradient colors={['#7BCFD6', '#FFF737']} start={[1, 0]} style={styles.gradient_btn} >
                    <View style={styles.phone_background}>
                        <Text style={styles.subtext}>имя</Text>
                        <TextInput style={styles.input} placeholder='Андрей' value={name} onChangeText={text => setName(text)} />
                    </View>
                </LinearGradient>
                <LinearGradient colors={['#FFF737', '#7BCFD6']} start={[1, 0]} style={styles.gradient_btn} >
                    <View style={styles.phone_background}>
                        <Text style={styles.subtext}>email</Text>
                        <TextInput style={styles.input} placeholder='example@mail.ru' autoCapitalize='none' keyboardType='email-address' value={email} onChangeText={(text) => setEmail(text)} />
                    </View>
                </LinearGradient>

                {Platform.OS === 'ios' ?
                    <LinearGradient colors={['#7BCFD6', '#FFF737']} start={[1, 0]} style={styles.gradient_btn} >
                        <View style={styles.text_with_background}>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setBView(!bView)}>
                                <Text style={styles.subtext}>местоположение</Text>
                                <View style={styles.row}>
                                    <Text style={styles.text}>{location}</Text>
                                    <View style={styles.row}>
                                        <Ionicons name='chevron-forward' size={24} style={{ color: '#7CD0D7' }} />
                                        <TouchableOpacity onPress={getLocation} activeOpacity={0.8} style={{ marginLeft: '10%' }} >
                                            <FontAwesome5 name='location-arrow' size={24} style={{ color: '#7CD0D7' }} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {bView && <Picker
                                selectedValue={location}
                                itemStyle={{ height: 150 }}
                                onValueChange={(value, index) => setLocation(value)}>
                                {country.map(obj => <Picker.Item color='#fff' key={obj} label={obj} value={obj} />)}
                            </Picker>}
                        </View>
                    </LinearGradient> :

                    <LinearGradient colors={['#7BCFD6', '#FFF737']} start={[1, 0]} style={styles.gradient_btn} >
                        <View style={styles.text_with_background_android}>
                            <Text style={styles.subtext_android}>местоположение</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Picker
                                    selectedValue={location}
                                    style={{ color: '#fff', width: '85%' }}
                                    onValueChange={(value, index) => setLocation(value)}>
                                    {country.map(obj => <Picker.Item key={obj} label={obj} value={obj} />)}
                                </Picker>
                                <TouchableOpacity onPress={getLocation} activeOpacity={0.8} style={{}} >
                                    <FontAwesome5 name='location-arrow' size={24} style={{ color: '#7CD0D7' }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>}


                <TouchableOpacity activeOpacity={0.8} onPress={sendData} disabled={disable} style={styles.mt} >
                    <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
                        {disable ? <ActivityIndicator style={{ paddingVertical: '5%' }} color="white" /> : <Text style={styles.text_btn} >Ок</Text>}
                    </ImageBackground>
                </TouchableOpacity>



            </View>
        </SafeAreaView>
    )
}

export default DataScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#6E7476',
        flex: 1,
    },
    main: {
        padding: '5%',
        marginTop: '10%',
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
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Raleway_400Regular'
    },


    text: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Raleway_400Regular'
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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '2%',
    },
    mt: {
        marginTop: '5%'
    },
    gradient_background: {
        marginTop: '30%',
        borderRadius: 5,
        padding: '5%',
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
        height: 52
    },
    // конец кнопки

})

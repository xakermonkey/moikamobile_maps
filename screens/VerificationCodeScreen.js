import React, { useLayoutEffect, useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, ImageBackground, Alert, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { domain_mobile } from '../domain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';


function VerificationCodeScreen({ navigation, route }) {
    // const VerificationCodeScreen = ({ navigation }) => {

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Ionicons name='chevron-back' size={32} color={'#7CD0D7'} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);
    // useLayoutEffect(() => {
    //     navigation.setOptions({
    //       headerBackTitle: '',
    //       headerBackTitleVisible: false,
    //       headerShadowVisible: false,
    //     })
    // }, [navigation])

    const [code, setCode] = useState('');
    const [disable, setDisable] = useState(false);

    const sendCode = async () => {
        setDisable(true);
        try {
            const res = await axios.post(domain_mobile + "/api/set_code", { "number": route.params.number, "code": code });
            await AsyncStorage.setItem("token", res.data.token);
            await AsyncStorage.setItem("phone", route.params.number);
            if (res.data.user.location.location != null) {
                await AsyncStorage.setItem("location", res.data.user.location.location);
            }
            if (res.data.user.first_name != null) {
                await AsyncStorage.setItem("name", res.data.user.first_name);
            }
            if (res.data.user.email != null) {
                await AsyncStorage.setItem("email", res.data.user.email);
            }
            // if (res.data.first_join == true){
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Data" }]
                }));
            // }else{
            //     navigation.dispatch(
            //         CommonActions.reset({
            //             index: 0,
            //             routes: [{ name: "MainMenu" }]
            //         }));
            // }

        }
        catch (err) {
            Alert.alert("Ошибка!", "Введен некорректный код доступа");
            setDisable(false);
        }

    }


    return (
        <SafeAreaView style={styles.container} >
            <StatusBar />
            <View style={styles.main}>

                <Text style={styles.title_text}>Код из СМС</Text>


                <LinearGradient colors={['#7BCFD6', '#FFF737']} start={[1, 0]} style={styles.gradient_btn} >
                    <View style={styles.phone_background}>
                        <TextInput maxLength={4} style={styles.input} textContentType='oneTimeCode' value={code} autoFocus={true} keyboardType="number-pad" onChangeText={text => setCode(text)} />
                    </View>
                </LinearGradient>

                <TouchableOpacity activeOpacity={0.8} onPress={sendCode} disabled={disable} style={styles.mt} >
                    <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
                        {disable ? <ActivityIndicator style={{ paddingVertical: '5%' }} color="white" /> : <Text style={styles.text_btn} >Далее</Text>}
                    </ImageBackground>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    )
}

export default VerificationCodeScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#6E7476',
        flex: 1,
    },
    main: {
        padding: '5%',
    },

    input: {
        // marginTop: '2%',
        textAlign: 'center',
        fontSize: 24,
        color: '#fff',
        fontFamily: 'Raleway_400Regular'
    },

    gradient_btn: {
        marginTop: '5%',
        borderRadius: 5,
        justifyContent: 'center',
        padding: 1,
    },
    phone_background: {
        paddingHorizontal: '5%',
        paddingVertical: '3%',
        // alignItems: 'center',
        backgroundColor: '#6E7476',
        borderRadius: 5,
    },
    mt: {
        marginTop: '5%'
    },
    text: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Raleway_400Regular',
    },

    title_text: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Raleway_700Bold',
        textTransform: 'uppercase',
        textAlign: 'center',
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

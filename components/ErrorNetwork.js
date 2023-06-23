import { StyleSheet, Text, View, Image, ImageBackground, StatusBar, TouchableOpacity } from 'react-native'
import React, {useState, useEffect} from 'react'
import NetInfo from "@react-native-community/netinfo";


const ErrorNetwork = ({reconnectServer, title}) => {

    const [showElement, setShowElement] = useState(false);

    console.log(reconnectServer);

    useEffect(() => {
        const timeout = setTimeout(() => {
          setShowElement(true);
        }, 5000);
    
        return () => clearTimeout(timeout); // Очистка таймера при размонтировании компонента
      }, []);


    const clickOutside = () => {

        reconnectServer();
    }

    return (
        <View style={styles.container}>
            <StatusBar />
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, padding: '5%' }}>
                <Image source={require('../assets/images/logo_succes.png')} />
                <Text style={[styles.bold_text, { textAlign: 'center' }]}>{title}</Text>
                <View style={{ width: '100%', marginTop: '20%' }}>
                    {showElement && <TouchableOpacity activeOpacity={0.8} onPress={clickOutside} style={{}} >
                        <ImageBackground source={require('../assets/images/button.png')} resizeMode='stretch' style={styles.bg_img} >
                            <Text style={styles.text_btn} >Повторить</Text>
                        </ImageBackground>
                    </TouchableOpacity>}
                </View>
            </View>
        </View>
    )
}

export default ErrorNetwork

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#6E7476',
        flex: 1,
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
})
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert } from 'react-native';


export const getPermissionImage = async () => {
        if (Platform.OS !== 'web') {
            const res = await ImagePicker.getMediaLibraryPermissionsAsync()
            if (!res.granted) {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    return false;
                }
            }
            return true;
        }
        return true;
}

export const getPermissionLocation = async () => {
    const res = await Location.getForegroundPermissionsAsync();
    if (res.status !== 'granted') {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Ошибка", "Необходимо включить определение геопозиции");
            return false;
        }
        return true;
    }
}
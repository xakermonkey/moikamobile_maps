# Сборка проектов

## Последние успешные сборки (07.07.2024) выполнялись на IDE:
* iOS: Xcode 15.4 (15F31d)
* Android: Android Studio Koala | 2024.1.1

## Зависимости
* Node.js: v18.16.0
* npm: 9.7.2
* Expo CLI: 6.3.7
* React Native: 0.71.8

## Подготовка:
1. `cd ../moikamobile_maps`
2. `expo install`

## Сборка:
### iOS:
1. `cd ../moikamobile_maps/ios`
2. `pod install`
3. В Xcode открыть `../moikamobile_maps/ios/T4YC.xcworkspace`
4. Авторизироваться в аккаунте разработчика
   `Targets -> T4YC -> Signing & Capabilities`
5. `Product -> Archive`

При возникновении ошибки в

`../moikamobile_maps/ios/Pods/boost/boost/container_hash/hash.hpp`

строку `struct hash_base : std::unary_function<T, std::size_t> {};`

заменить на `struct hash_base : std::__unary_function<T, std::size_t> {};`

#### Ошибка возникает из-за слишком устаревших библиотек проекта

### Android:
1. В Android Studio открыть папку `../moikamobile_maps/android`
2. Дождаться Gradle Sync
3. `Build -> Generate Signed Bundle / APK -> Android App Bundle`
4. Выбираем Key store
   `../moikamobile_maps/KEYS_GOOGLE_PLAY/key_store`
5. Вводим пароль из `../moikamobile_maps/KEYS_GOOGLE_PLAY/pass.txt`
6. Выбираем Key alias `key store`
7. Вводим пароль из `../moikamobile_maps/KEYS_GOOGLE_PLAY/pass.txt` -> Next
8. Выбираем папку сохранения -> release -> Create


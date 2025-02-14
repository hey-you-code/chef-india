import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Dimensions,
  Animated,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Menu from '../components/Menu/Menu';
import {useSelector} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AuthStack from '../navigation/AuthStack';

import {Image} from 'react-native';
import {useRoute} from '@react-navigation/native';

const MenuScreen = ({navigation}) => {
  const route = useRoute();
  const {actionApplicable} = route.params || {};
  const {height: HEIGHT, width: WIDTH} = Dimensions.get('window');
  const [tab, setTab] = useState(0);
  const [menuType, setMenuType] = useState('');
  const [country, setCountry] = useState('India');

  const {bookingType} = useSelector(state => state.chefBooking);

  const {user} = useSelector(state => state.user);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (tab === 1) {
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [tab]);

  if (!user) {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        {/* <NavigationContainer> */}
        <AuthStack />
        {/* </NavigationContainer> */}
      </GestureHandlerRootView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ImageBackground
        source={{
          uri: 'https://i.pinimg.com/736x/1f/cc/d1/1fccd1628330a657b5a9c364661d9fb0.jpg',
        }}
        resizeMode="repeat"
        className=""
        style={{flex: 1}}>
        <View
          style={{flex: 1, height: '100%', width: WIDTH}}
          className={`${
            tab === 0 ? 'bg-white/60' : 'bg-white/90'
          } absolute inset-0`}
        />

        <StatusBar
          translucent={true}
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />
        {/* Header */}
        <View
          className={`mx-2 flex-row  space-x-2 ${
            tab === 0 ? 'my-[50px]' : 'mt-[50px] mb-[10px]'
          } `}>
          <TouchableOpacity
            onPress={() => {
              if (tab === 0) {
                navigation.goBack();
                return;
              }
              // Slide out animation
              Animated.timing(slideAnim, {
                toValue: WIDTH,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                setTab(tab - 1);
                slideAnim.setValue(WIDTH); // Reset position for next time
              });
            }}>
            <Ionicons name="arrow-back" size={30} color={'black'} />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-black">MENU</Text>
        </View>
        {tab === 0 ? (
          <View
            style={{width: WIDTH * 0.95}}
            className="mx-auto max-w-md flex-row justify-between">
            {/* <TouchableOpacity
              onPress={() => {
                setTab(tab + 1);
                setMenuType('regular');
              }}
              activeOpacity={0.5}
              className="h-[250px] w-[47%] justify-center bg-black/60 rounded-2xl relative">
              <View className="absolute w-full h-full rounded-2xl overflow-hidden">
                <Image
                  className="h-full w-full object-cover"
                  source={{
                    uri: 'https://i.pinimg.com/736x/87/3d/24/873d24820a906727792dcfa4a68a92e6.jpg',
                  }}
                />
              </View>

              <View className="bg-black/40 space-y-4 h-full p-3 rounded-2xl">
                <Text className="text-white text-[32px] font-bold">
                  Regular Menu
                </Text>

             
                <View className="absolute bottom-4 items-end w-[98%]">
                  <Ionicons
                    name="arrow-forward-circle"
                    color="white"
                    size={45}
                  />
                </View>
              </View>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => {
                setTab(tab + 1);
                setMenuType('special');
              }}
              activeOpacity={0.5}
              className="h-[250px] w-[50%] justify-center bg-black/60 rounded-2xl">
              <View className="absolute w-full h-full rounded-2xl overflow-hidden">
                <Image
                  className="h-full w-full object-cover"
                  source={{
                    uri: 'https://i.pinimg.com/736x/0f/ef/a9/0fefa9845c8285afaae157c4ac78c65f.jpg',
                  }}
                />
              </View>

              <View className="bg-black/40 space-y-4 h-full p-3 rounded-2xl">
                <Text className="text-white text-[25px] font-bold">
                  Chef India Menu
                </Text>

                {/* Updated View for Ionicons */}
                <View className="absolute bottom-4 items-end w-[98%]">
                  <Ionicons
                    name="arrow-forward-circle"
                    color="white"
                    size={45}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : undefined}
        {tab == 1 && menuType !== '' ? (
          <Animated.View
            style={{
              transform: [{translateX: slideAnim}],
              flex: 1,
            }}>
            <Menu
              menuType={menuType}
              country={country}
              actionApplicable={actionApplicable}
              preview={false}
            />
          </Animated.View>
        ) : undefined}
      </ImageBackground>
    </SafeAreaView>
  );
};

export default MenuScreen;

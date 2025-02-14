import {
  View,
  Text,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import Menu from '../components/Menu/Menu';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import { resetMenu } from '../features/slices/chefbookingSlice';

const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');

const SpecificMenuScreen = ({navigation}) => {
  const route = useRoute();
  const dispatch = useDispatch();
  const {actionApplicable, menuType, country} = route.params || {};
  const {formData} = useSelector(state => state.chefBooking);

  const [isMenuVisible, setIsMenuVisible] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsMenuVisible(true);
      return () => {
        // Delay hiding to ensure smooth transition
        setTimeout(() => setIsMenuVisible(false), 100);
      };
    }, []),
  );

  return (
    <SafeAreaView style={{width: WIDTH}} className="flex-1 bg-white relative">
      <ImageBackground
        source={{
          uri: 'https://i.pinimg.com/736x/1f/cc/d1/1fccd1628330a657b5a9c364661d9fb0.jpg',
        }}
        resizeMode="repeat"
        className=""
        style={{flex: 1}}>
        <View
          style={{flex: 1, height: '100%', width: WIDTH}}
          className="bg-white/90 absolute inset-0"
        />

        <StatusBar
          translucent={true}
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />

        {/* Header */}
        <View className="mx-2 flex-row justify-between mt-[50px] mb-[10px]">
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => {
                dispatch(resetMenu());
                navigation.goBack();
              }}>
              <Ionicons name="arrow-back" size={30} color={'black'} />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold text-black">MENU</Text>
          </View>
        </View>

        {/* Always render Menu but control visibility */}
        <View
          style={{
            opacity: isMenuVisible ? 1 : 0,
            pointerEvents: isMenuVisible ? 'auto' : 'none',
            flex: 1,
          }}>
          <Menu
            menuType={menuType}
            country={country}
            actionApplicable={actionApplicable}
            preview={false}
          />
        </View>

        {formData?.menu?.items?.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              console.log('Checkout: ', JSON.stringify(formData, null, 2));
              navigation.navigate('SpecialCheckout');
            }}
            style={{zIndex: 999, alignSelf: 'center'}}
            className="bg-green-500 absolute bottom-12 rounded-[16px] flex-row items-center justify-start w-[90%] py-4 px-6 space-x-4">
            <Ionicons name="cart" size={24} color="white" />
            <Text className="text-white text-xl font-semibold">
              Check Out{' '}
              <Text className="">{formData?.menu?.items?.length}</Text> Items
            </Text>
            <View className="absolute w-[60px] h-full right-12 top-3">
              {formData?.menu?.items?.slice(0, 3).map((item, index) => (
                <View key={item.id} className="">
                  {item?.itemImage && (
                    <Image
                      key={item?.id}
                      source={{uri: item?.itemImage}}
                      style={{left: 2 + index * 20}}
                      className="h-[40px] w-[40px] rounded-full absolute border-2 border-white"
                    />
                  )}
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SpecificMenuScreen;

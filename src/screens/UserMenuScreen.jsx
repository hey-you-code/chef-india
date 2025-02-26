import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useRoute} from '@react-navigation/native';
import Menu from '../components/Menu/Menu';
import {useDispatch, useSelector} from 'react-redux';
import { resetMenu } from '../features/slices/chefbookingSlice';

const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');

const UserMenuScreen = ({navigation}) => {
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();
  const route = useRoute();
  const {actionApplicable, menuType, country} = route.params || {};
  return (
    <View style={{width: WIDTH}} className="flex-1 bg-white relative">
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
        <View className="mx-2 flex-row justify-between items-center mt-[50px] mb-[10px]">
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={() => {
                // dispatch(resetMenu());
                navigation.goBack();
                }}>
              <Ionicons name="arrow-back" size={30} color={'black'} />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold text-black">MENU</Text>
          </View>

          {formData?.menu?.totalItems > 0 && (
            <TouchableOpacity
              onPress={() => {
                console.log('Checkout: ', JSON.stringify(formData, null, 2));
                navigation.navigate('SpecialCheckout');
              }}
              style={{zIndex: 999, alignSelf: 'center'}}
              className="bg-green-500  rounded-[12px] flex-row items-center justify-start w-[50%] py-3  px-6 space-x-2">
              <Ionicons name="cart" size={24} color="white" />
              <Text className="text-white font-medium text-[16px]">
                Checkout {formData?.menu?.totalItems} items
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            flex: 1,
          }}>
          <Menu
            menuType={menuType}
            country={country}
            actionApplicable={actionApplicable}
            preview={true}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default UserMenuScreen;

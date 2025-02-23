import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {useDispatch, useSelector} from 'react-redux';
import SecondPage from '../components/ChefBooking/SecondPage';

import Menu from '../components/Menu/Menu';

import {
  moveToPreviousPage,
  resetFormData,
} from '../features/slices/chefbookingSlice';
import FirstPage from '../components/ChefBooking/FirstPage';


const {height: HEIGHT, width: WIDTH} = Dimensions.get("window");


const SpecialBookingScreen = ({navigation}) => {
  const {currentPage} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();
  return (
    <SafeAreaView className="flex-1 bg-white rounded-t-3xl">
      <ImageBackground
        source={{
          uri: 'https://i.pinimg.com/736x/1f/cc/d1/1fccd1628330a657b5a9c364661d9fb0.jpg',
        }}
        resizeMode="repeat"
        className=""
        style={{flex: 1}}>
        <View
          style={{flex: 1, height: '100%', width: WIDTH}}
          className=" bg-white/90 absolute inset-0"
        />

        <StatusBar
          translucent={true}
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />
        {currentPage === 0 ? (
          <View className="mx-2 flex-row space-x-2 items-center py-2 mt-[50px] ">
            <TouchableOpacity
              className=""
              onPress={() => {
                navigation.goBack();
                // setTimeout(() => dispatch(resetFormData()), 0); 
              }}>
              <Ionicons name="close-circle" size={30} color="#6b7280" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-semibold tracking-tighter text-center text-gray-500">
                Special Booking
              </Text>
            </View>
            <View className="mx-2" />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => dispatch(moveToPreviousPage())}
            className="mx-2 flex-row  items-center py-2 mt-[50px]">
            <Ionicons name="chevron-back" size={34} color="#6b7280" />

            <Text className="text-2xl  tracking-tighter  text-gray-500">
              Back
            </Text>
          </TouchableOpacity>
        )}

        <FirstPage navigation={navigation} />
        {/* {currentPage === 1 ? <SecondPage /> : undefined}
        {currentPage === 2 ? <Menu actionApplicable={true} /> : undefined}
   */}
        {/* NEXT PAGE */}
        {/* Pick Menu */}

        {/* NEXT PAGE */}
        {/* Pay and confirm booking */}
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SpecialBookingScreen;

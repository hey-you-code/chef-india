import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import React, {useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FirstPage from '../components/ChefBooking/FirstPage';
import {useDispatch, useSelector} from 'react-redux';
import SecondPage from '../components/ChefBooking/SecondPage';
import {
  moveToPreviousPage,
  resetFormData,
  resetMenu,
  setBookingType,
  setFormData,
} from '../features/slices/chefbookingSlice';
import Menu from '../components/Menu/Menu';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AuthStack from '../navigation/AuthStack';
// import welcomepage from "../../assets/welcomepage.png"

const ChefBookingScreen = ({navigation}) => {
  const {height: HEIGHT, width: WIDTH} = Dimensions.get('window');
  const {currentPage} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();

  const {user} = useSelector(state => state.user);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(resetFormData());
    });
    return () => {
      unsubscribe(); // Cleanup
    };
  }, [navigation, dispatch]);



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
          className=" bg-white/70 absolute inset-0"
        />

        <StatusBar
          translucent={true}
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />

        <View className="mx-2 flex-row space-x-2 items-center py-2 my-[50px]">
          <TouchableOpacity
            className="z-20"
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="#FF3130" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-[26px] font-bold tracking-tighter text-left text-[#FF3130]">
              Book Your Chef
            </Text>
          </View>
          <View className="mx-2" />
        </View>

        <View>
          {/* <Text className="px-2 py-4 text-2xl text-black/80 font-semibold tracking-tighter uppercase">
            TYPE OF BOOKING
          </Text> */}
          <View className="w-[90vw] mx-auto space-y-4">
            <View className="w-full mx-auto max-w-md flex-row justify-between">
              <TouchableOpacity
                onPress={() => {
                  dispatch(
                    setFormData({field: 'bookingType', value: 'regular'}),
                  );
                  navigation.navigate('RegularBooking');
                }}
                activeOpacity={0.5}
                className="h-[250px] w-[48%] justify-center bg-black/60 rounded-2xl relative">
                <View className="absolute w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    className="h-full w-full"
                    source={{
                      uri: 'https://i.pinimg.com/736x/e0/95/ca/e095cae8b58305d83e98f7f7b0f64370.jpg',
                    }}
                  />
                </View>

                <View className="bg-black/50 space-y-4 h-full p-3 rounded-2xl">
                  <Text className="text-white text-[28px] font-bold">
                    Regular
                  </Text>
                  <Text className="text-gray-100 italic text-[18px]">
                    Booking for small personal events for less than 10 people
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

              <TouchableOpacity
                onPress={() => {
                  dispatch(
                    setFormData({field: 'bookingType', value: 'special'}),
                  );
                  navigation.navigate('SpecialBooking');
                }}
                activeOpacity={0.5}
                className="h-[250px] w-[48%] justify-center bg-black/60 rounded-2xl">
                <View className="absolute w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    className="h-full w-full"
                    source={{
                      uri: 'https://i.pinimg.com/736x/d0/75/12/d075122cca0072aa07a4e3cfc00d70fd.jpg',
                    }}
                  />
                </View>

                <View className="bg-black/50 space-y-4 h-full p-3 rounded-2xl">
                  <Text className="text-white text-[28px] font-bold">
                    Special
                  </Text>
                  <Text className="text-gray-100 text-[18px] italic">
                    Booking for larger events
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

            <View className="w-full mx-auto max-w-md flex-row justify-between">
              <TouchableOpacity
                onPress={() => {
                  dispatch(
                    setFormData({field: 'bookingType', value: 'catering'}),
                  );
                  dispatch(setFormData({field: 'catering', value: true}));
                  navigation.navigate('SpecialBooking');
                }}
                activeOpacity={0.5}
                className="h-[250px] w-[48%] justify-center bg-black/60 rounded-2xl">
                <View className="absolute w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    className="h-full w-full"
                    source={{
                      uri: 'https://i.pinimg.com/736x/c1/ca/33/c1ca33bc3f210da47a80bdc3b61990e0.jpg',
                    }}
                  />
                </View>

                <View className="bg-black/50 space-y-4 h-full p-3 rounded-2xl">
                  <Text className="text-white text-[28px] font-bold">
                    Catering
                  </Text>
                  <Text className="text-gray-100 text-[18px] italic">
                    Book catering services for your events
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
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('BusinessBooking');
                }}
                activeOpacity={0.5}
                className="h-[250px] w-[48%] justify-center bg-black/60 rounded-2xl relative">
                <View className="absolute w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    className="h-full w-full"
                    source={{
                      uri: 'https://i.pinimg.com/736x/f0/dc/85/f0dc85ee3e7623f1ebed290146351df4.jpg',
                    }}
                  />
                </View>

                <View className="bg-black/50 space-y-4 h-full p-3 rounded-2xl">
                  <Text className="text-white text-[28px] font-bold">
                    Business
                  </Text>
                  <Text className="text-gray-100 italic text-[18px]">
                    Hire Chefs for your business
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
          </View>
        </View>

        {/* NEXT PAGE */}
        {/* Pick Menu */}

        {/* NEXT PAGE */}
        {/* Pay and confirm booking */}
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ChefBookingScreen;

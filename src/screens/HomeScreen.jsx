import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypoicons from 'react-native-vector-icons/Entypo';
import bookchef from '../../assets/bookchef.png';
import exploremenu from '../../assets/exploremenu.png';
import Banner from '../components/Home/Banner';
import Footer from '../components/Home/Footer';
import {useDispatch, useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import logo from '../../assets/logo.png';
import menu_tab from '../../assets/menu_tab.png';
import {resetFormData} from '../features/slices/chefbookingSlice';
import {useUpdateAddressMutation} from '../features/auth/authApiSlice';
import {
  reverseGeoCoding,
  fetchCurrentLocation,
} from '../utils/utilityFunctions';
import {setUser} from '../features/slices/userSlice';
import LottieView from 'lottie-react-native';

const OPERATED_STATES = ['Assam', 'Telangana'];

const HomeScreen = ({navigation}) => {
  const {height: HEIGHT, width: WIDTH} = Dimensions.get('window');
  const {user} = useSelector(state => state.user);
  const [fetchingCurrentLocation, setFetchingCurrentLocation] = useState(false);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(resetFormData());
  // }, []);

  const [updateAddress, {isLoading: isUpdatingAddess}] =
    useUpdateAddressMutation();

  const getCurrentLocation = async () => {
    try {
      setFetchingCurrentLocation(true);
      const {latitude, longitude} = await fetchCurrentLocation();
      setFetchingCurrentLocation(false);
      if (!latitude && !longitude) {
        notify('error', {
          params: {
            description: 'Failed to fetch location',
            title: 'Current Locations',
          },
          config: {
            isNotch: true,
            notificationPosition: 'top',
            // animationConfig: "SlideInLeftSlideOutRight",
            // duration: 200,
          },
        });
        return null;
      }

      const {address} = await reverseGeoCoding(latitude, longitude);

      // console.log('address:', address);

      if (!address) {
        return null;
      }

      const response = await updateAddress(address).unwrap();

      // console.log('response: ', response?.data?.user);

      dispatch(
        setUser({
          ...user,
          user: response?.data?.user,
        }),
      );
    } catch (error) {
      setFetchingCurrentLocation(false);
      notify('error', {
        params: {
          description: 'Failed to fetch location',
          title: 'Current Locations',
        },
        config: {
          isNotch: true,
          notificationPosition: 'top',
          // animationConfig: "SlideInLeftSlideOutRight",
          // duration: 200,
        },
      });
      return;
    }
  };

  useEffect(() => {
    if (user && !user?.user?.address) {
      getCurrentLocation();
    }
  }, [user]);

  console.log("user: ", user);

  // console.log('userrr: ', user);

  if (user && !OPERATED_STATES.includes(user?.user?.address?.state)) {
    return (
      <SafeAreaView className="flex-1 bg-white px-6">
        <View className="flex-1  items-center">
          <LottieView
            source={require('../../assets/animation/unavailable_location.json')} // Replace with your Lottie file
            autoPlay
            loop
            style={{width: 300, height: 300}}
          />

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-800 mt-6 text-center">
            Not available
          </Text>

          {/* Description */}
          <Text className="text-lg text-gray-600 mt-4 text-center">
            Sorry! Chef India is not in your area yet, We will be there soon.
            Try changing your location.
          </Text>

          {/* Map Button */}
          <TouchableOpacity
            className="bg-red-500 px-8 py-4 rounded-2xl mt-8"
            onPress={() => navigation.navigate('Map')}>
            <Text className="text-white text-lg font-semibold">
              Set location Manually
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
          className=" bg-white/90 absolute inset-0"
        />
        <StatusBar
          translucent={true}
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />
        <View className="flex-row justify-between w-screen  items-center mt-[50px]">
          <View className="pl-2">
            {/* <Text className="text-3xl font-bold text-black">Cheff India</Text> */}
            <Image source={logo} className="h-[30px] w-[160px]" />
          </View>
          <View className="flex-row items-center space-x-2">
            {user && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Notifications');
                }}
                className="px-2 max-w-[80%]">
                <Ionicons name="notifications" color="black" size={32} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className=" max-w-[80%] mx-2">
              {user ? (
                <View className="h-[40px] w-[40px]  bg-black/90 rounded-full items-center justify-center">
                  <Text
                    ellipsizeMode="tail"
                    className="text-[#FFF] text-center text-xl font-bold">
                    {user.user?.name[0]}
                  </Text>
                </View>
              ) : (
                <Ionicons name="person-circle" color="#525252" size={40} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Map');
          }}
          className="flex-row  items-start mx-2 my-2">
          {user?.user && user?.user?.address ? (
            <View>
              <Text
                style={{fontFamily: 'Roboto Regular'}}
                className="text-[16px] tracking-wide text-black font-bold ">
                <View className="pr-[2px]">
                  <Ionicons name="location-sharp" size={18} color={'red'} />
                </View>
                {user?.user?.address?.streetName ||
                  user?.user?.address?.streetNumber ||
                  user?.user?.address?.premise ||
                  user?.user?.address?.sublocalityLevel2 ||
                  user?.user?.address?.sublocalityLevel1 ||
                  user?.user?.address?.location?.locationName ||
                  ''}{' '}
                {''}
                {/* {user?.user?.address?.city || ''} */}
                {/* {user?.user?.address?.state || ''}{' '} */}
                {/* {user?.user?.address?.postalCode || ''} */}
              </Text>
              <Text
                style={{fontFamily: 'Roboto Regular'}}
                className="text-[13px] tracking-wide text-gray-500 text-left">
                {/* {user?.user?.address?.streetName ||
                  user?.user?.address?.streetNumber ||
                  user?.user?.address?.premise ||
                  user?.user?.address?.sublocalityLevel2 ||
                  user?.user?.address?.sublocalityLevel1 ||
                  user?.user?.address?.location?.locationName || 
                  ''}{' '}
                {''} */}
                {user?.user?.address?.city || ''},
                {user?.user?.address?.state || ''} ,
                {user?.user?.address?.postalCode || ''} ,
                {user?.user?.address?.country || ''}
              </Text>
            </View>
          ) : fetchingCurrentLocation ? (
            <Text
              style={{fontFamily: 'Roboto Regular'}}
              className="text-red-500">
              Fetching...
            </Text>
          ) : (
            <></>
            // <Text
            //   style={{fontFamily: 'Roboto Regular'}}
            //   className="text-gray-500">
            //   Select Manually
            // </Text>
          )}
          {user?.user && (
            <View>
              <Ionicons name="chevron-down" size={20} color={'#9ca3af'} />
            </View>
          )}
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Banner />

          <View className="flex-1 mt-8">
            <View className="w-screen flex-row justify-center space-x-8 max-w-md">
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('BookChef');
                }}
                activeOpacity={0.5}
                style={{}}
                className=" w-[43%] bg-gray-200  h-[240px] relative rounded-2xl justify-end">
                <Image
                  className=" h-[100%] w-[100%] absolute mx-auto overflow-hidden rounded-2xl"
                  source={{
                    uri: 'https://i.pinimg.com/736x/ca/cd/e1/cacde1eadac0b8358c742e83961a5222.jpg',
                  }}
                />
                <View className="h-[100%] w-[100%] bg-black/50 absolute rounded-2xl" />

                <Text className="z-30 text-left px-4 text-white text-[19px] font-semibold  mx-auto  w-full ">
                  Book a Chef
                </Text>
                <View className="mx-6 my-2">
                  <Ionicons
                    name="arrow-forward-circle"
                    color="white"
                    size={45}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => navigation.navigate('Menu')}
                style={{}}
                className=" w-[43%] bg-gray-200   h-[240px] relative rounded-2xl justify-end">
                {/* <View className="absolute bg-black/40 inset-0 z-20 h-full w-full " /> */}
                <Image
                  className=" h-[100%] w-[100%] absolute mx-auto overflow-hidden rounded-2xl"
                  source={menu_tab}
                />
                <View className="h-[100%] w-[100%] bg-black/50 absolute rounded-2xl" />

                <Text className="z-30 text-left px-4 text-white text-[19px] font-semibold  mx-auto  w-full flex-nowrap">
                  Explore
                </Text>
                <View className="mx-6 my-2">
                  <Ionicons
                    name="arrow-forward-circle"
                    color="white"
                    size={45}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View className="w-[100vw] max-w-md my-4  px-4 py-6">
            <Footer />
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default HomeScreen;

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
import React, {useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import bookchef from '../../assets/bookchef.png';
import exploremenu from '../../assets/exploremenu.png';
import Banner from '../components/Home/Banner';
import Footer from '../components/Home/Footer';
import {useDispatch, useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import logo from '../../assets/logo.png';
import menu_tab from '../../assets/menu_tab.png';
import {resetFormData} from '../features/slices/chefbookingSlice';

const HomeScreen = ({navigation}) => {
  const {height: HEIGHT, width: WIDTH} = Dimensions.get('window');
  const {user} = useSelector(state => state.user);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(resetFormData());
  // }, []);

  console.log('loggedInUser: ', user?.user?.name[0]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* <LinearGradient
        colors={['#FF3130', 'white']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={{paddingHorizontal: 10}}
        className="absolute w-screen h-[100px]"
      /> */}
      {/* Header */}
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
            <Image source={logo} className="h-[40px] w-[180px]" />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            className="px-2">
            {user ? (
              <View className="h-[40px] w-[40px]  bg-black/90 rounded-full items-center justify-center">
                <Text className="text-[#FFF] text-center text-xl font-bold">
                  {user.user?.name[0]}
                </Text>
              </View>
            ) : (
              <Ionicons name="person-circle" color="#525252" size={40} />
            )}
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1">
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
                {/* <View className="absolute bg-black/40 inset-0 z-20 h-full w-full " /> */}
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

import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch} from 'react-redux';
import {resetMenu, setFormData} from '../features/slices/chefbookingSlice';

const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');

const UserDecisionScreen = ({navigation}) => {
  const dispatch = useDispatch();


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(resetMenu());
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{width: WIDTH}} className="flex-1 bg-white">
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
        <View className="mx-2 flex-row space-x-2 mt-[50px] mb-[10px]">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color={'black'} />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-black">SELECT TYPE</Text>
        </View>

        <View
          style={{width: WIDTH}}
          className="mt-[20px] p-6 space-y-6 relative">
          <TouchableOpacity
            onPress={() => {
              dispatch(setFormData({field: 'catering', value: true}));
              navigation.navigate('SpecificMenu', {
                actionApplicable: true,
                menuType: 'special',
                country: 'India',
              });
            }}
            // style={{marginHorizontal: 'auto'}}
            className="h-[100px] w-[96%] mx-auto rounded-2xl space-y-2">
            <View className="absolute w-full h-full rounded-2xl overflow-hidden">
              <Image
                className="h-full w-full"
                resizeMode="cover"
                source={{
                  uri: 'https://i.pinimg.com/736x/b0/60/14/b060148f0c215b5ac8b72694d67e1136.jpg',
                }}
              />
              <View className="h-full w-full bg-black/50  absolute" />
            </View>
            <View className="px-3 py-2 ">
              <Text className="text-white text-left font-semibold text-2xl">
                Catering
              </Text>
              <Text className="text-left text-gray-100 pt-2">
                Ingridients will be included in the package
              </Text>
              <View className="absolute right-4 top-2">
                <Ionicons name="arrow-forward-circle" color="white" size={45} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              dispatch(setFormData({field: 'catering', value: false}));
              navigation.navigate('UserMenu', {
                actionApplicable: true,
                menuType: 'special',
                country: 'India',
              });
            }}
            className="h-[100px] w-[96%] mx-auto rounded-2xl space-y-2">
            <View className="absolute w-full h-full rounded-2xl overflow-hidden">
              <Image
                className="h-full w-full"
                resizeMode="cover"
                source={{
                  uri: 'https://i.pinimg.com/736x/20/98/13/209813e33c5f411ddfd49d98eef34c14.jpg',
                }}
              />
              <View className="h-full w-full bg-black/60  absolute" />
            </View>
            <View className="px-3 py-2 ">
              <Text className="text-white text-left font-semibold text-2xl">
                Personal
              </Text>
              <Text className="text-left text-gray-100 pt-2">
                Ingridients will be provided by the customer
              </Text>
              <View className="absolute right-4 top-2">
                <Ionicons name="arrow-forward-circle" color="white" size={45} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default UserDecisionScreen;

import {View, Text, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Caterer = ({image, name, perPlatePrice, distance, navigation}) => {
  const formatDistance = distance => {
    return distance < 1000
      ? `${distance.toFixed(0)} meters away`
      : `${(distance / 1000).toFixed(1)} Kms away`;
  };
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('SpecificCaterer');
      }}
      style={{elevation: 5}}
      className="rounded-3xl mx-auto h-[120px] w-[95%] m-2 bg-white flex-row  justify-between">
      <Image
        source={{
          uri:
            image ??
            'https://i.pinimg.com/736x/7a/2e/6f/7a2e6f3168389da97ede6279f9c89aaf.jpg',
        }}
        className="h-full w-[120px] object-cover rounded-l-3xl"
      />
      <View className="flex-row w-[70%] rounded-r-3xl justify-between pr-3">
        <View className="justify-between p-4">
          <View className="justify-between ">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{fontFamily: 'Anton'}}
              className="text-black  text-2xl ">
              {name}
            </Text>
            <Text style={{fontFamily: ''}} className="text-gray-600  text-sm ">
              {formatDistance(distance)}
            </Text>
          </View>
          <View>
            <Text style={{fontFamily: 'Anton'}} className="text-black text-lg">
              Rs. 350 <Text className="text-sm text-gray-500">per plate</Text>
            </Text>
          </View>
        </View>
        <View className="h-full w-[80px] rounded-r-3xl justify-between py-3 items-center">
          <View className="flex-row space-x-2 items-center">
            <Ionicons name="star" size={16} color={'black'} />
            <Text className="text-black">4.5</Text>
          </View>
          <View className="bg-gray-600 w-[40px] h-[40px] rounded-full justify-center items-center">
            <Ionicons
              name="arrow-forward"
              size={30}
              color={'white'}
              className="text-center"
            />
          </View>
        </View>
      </View>
      {/* <View className="bg-green-400 justify-end h-full w-[80px] rounded-r-3xl">

      </View> */}
    </TouchableOpacity>
  );
};

export default Caterer;

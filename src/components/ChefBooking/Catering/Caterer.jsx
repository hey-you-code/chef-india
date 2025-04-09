import {View, Text, Image, TouchableOpacity, Dimensions} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {setFormData} from '../../../features/slices/chefbookingSlice';


const {width, height} = Dimensions.get('window');

const Caterer = ({
  image,
  name,
  perPlatePrice,
  distance,
  navigation,
  cateringId,
}) => {
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();
  const formatDistance = distance => {
    return distance < 1000
      ? `${distance.toFixed(0)} meters away`
      : `${(distance / 1000).toFixed(1)} Kms away`;
  };

//   console.log('Key: ', cateringId);
  return (
    <TouchableOpacity
      onPress={() => {
        dispatch(setFormData({field: 'cateringId', value: cateringId}));
        navigation.navigate('SpecificCaterer', {
            name: name ?? 'Dummy Name',
            image: image ?? 'https://i.pinimg.com/736x/7a/2e/6f/7a2e6f3168389da97ede6279f9c89aaf.jpg'
        });
      }}
      style={{elevation: 5}}
      className="rounded-3xl  h-[120px] m-2 w-full bg-white flex-row  relative">
      <Image
        source={{
          uri:
            image ??
            'https://i.pinimg.com/736x/7a/2e/6f/7a2e6f3168389da97ede6279f9c89aaf.jpg',
        }}
        className="h-full w-[120px] object-cover rounded-l-3xl"
      />
      <View style={{flex: 1}} className="flex-row  rounded-r-3xl justify-between pr-3 overflow-hidden">
        <View className="justify-between p-4 items-start">
          <View className="justify-between">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{fontFamily: 'Anton'}}
              className="text-black  text-[20px] ">
              {name}
            </Text>
            <Text style={{fontFamily: ''}} className="text-gray-600  text-sm ">
              {formatDistance(distance)}
            </Text>
          </View>
          {/* <View>
            <Text style={{fontFamily: 'Anton'}} className="text-black text-lg">
              Rs. 350 <Text className="text-sm text-gray-500">per plate</Text>
            </Text>
          </View> */}
        </View>
        <View className="h-full pr-2 rounded-r-3xl justify-between py-3 items-center">
          <View className="flex-row space-x-2 items-center">
            <Ionicons name="star" size={13} color={'black'} />
            <Text className="text-black text-[13px]">4.5</Text>
          </View>
          <View className="bg-black p-2 rounded-full justify-center items-center">
            <Ionicons
              name="chevron-forward"
              size={30}
              color={'white'}
              className="text-center "
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

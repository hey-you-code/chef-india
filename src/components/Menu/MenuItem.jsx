import {View, Text, Image, Dimensions, TouchableOpacity} from 'react-native';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  addMenuItems,
  removeMenuItems,
  takeActionForMenuItems,
} from '../../features/slices/chefbookingSlice';

const MenuItem = ({
  id,
  name,
  image,
  price,
  description,
  tags,
  actionApplicable,
  preview,
}) => {
  const {height, width} = Dimensions.get('window');
  const dispatch = useDispatch();
  const {formData} = useSelector(state => state.chefBooking);

  const getItemCount = id => {
    const item = formData?.menu?.items.find(selected => selected.id === id);
    return item ? item.itemCount : 0;
  };

  // console.log('formDatafromMenu: ', formData?.menu?.items);

  return (
    <View
      style={{width: width * 0.99}}
      className="max-w-md border-b  border-gray-300 py-4 mx-auto">
      <View
        style={{width: width * 0.95}}
        className={`h-[130px] mx-auto flex-row rounded-xl justify-between items-start`}>
        <View className="px-2 space-y-1 justify-center w-[55%]">
          <Text className="text-left text-xl flex-wrap font-semibold tracking-tighter ">
            {name}
          </Text>
          {!preview ? <Text className="text-lg font-medium">₨ {price}</Text> : <Text className="text-lg font-medium">₨ 10</Text>}
          <Text numberOfLines={ 2} ellipsizeMode="tail" className="font-normal">
            {description}
          </Text>
        </View>
        <View className={` w-[35%]  items-center justify-center`}>
          <Image
            className="aspect-square w-[100%] rounded-xl"
            source={
              image
                ? {
                    uri: image,
                  }
                : {
                    uri: 'https://i.pinimg.com/736x/87/3d/24/873d24820a906727792dcfa4a68a92e6.jpg',
                  }
            }
          />

          {actionApplicable ? (
            getItemCount(id) > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  dispatch(
                    takeActionForMenuItems({
                      id: id,
                    }),
                  );
                }}
                className="absolute -bottom-4 border border-[#FF3130] bg-black/70 w-[70%] rounded-xl z-10 py-3">
                <Text className="text-xl text-[#FF3130]  text-center font-semibold">
                  Remove
                </Text>
              </TouchableOpacity>
            ) : (
              // <View className="absolute bottom-0 bg-black/80 border border-orange-500 w-[80%] rounded-xl z-10 flex-row justify-between items-center py-3">
              //   <TouchableOpacity
              //     onPress={() => {
              //       dispatch(
              //         removeMenuItems({
              //           id,
              //         }),
              //       );
              //     }}
              //     className=" min-w-[20%]  z-30  max-w-[35%] h-full rounded-l-xl items-center justify-center px-1">
              //     <Ionicons
              //       name="remove"
              //       color={'#f87171'}
              //       size={20}
              //       className=""
              //     />
              //   </TouchableOpacity>
              //   <Text className="text-white text-center font-semibold min-w-[30%] max-w-[60%]">
              //     {getItemCount(id)}
              //   </Text>
              //   <TouchableOpacity
              //     onPress={() => {
              //       dispatch(
              //         addMenuItems({
              //           category_id: 'veg',
              //           id: id,
              //         }),
              //       );
              //     }}
              //     className="min-w-[20%]  max-w-[35%] h-full rounded-r-xl  items-center justify-center px-1">
              //     <Ionicons name="add" color={'#4ade80'} size={20} />
              //   </TouchableOpacity>
              // </View>
              <TouchableOpacity
                onPress={() => {
                  console.log('tags: ', tags);

                  dispatch(
                    takeActionForMenuItems({
                      id: id,
                      itemName: name,
                      itemPrice: price,
                      itemImage: image,
                      itemTags: tags,
                      itemDescription: description,
                    }),
                  );
                }}
                className={`absolute -bottom-4 bg-orange-500 ${preview ? "" : ""} w-[70%] rounded-xl z-10 py-3`}>
                <Text className={`text-xl text-white  text-center font-semibold"`}>
                  Add
                </Text>
              </TouchableOpacity>
            )
          ) : undefined}
        </View>
      </View>
    </View>
  );
};

export default MenuItem;

import {View, Text, TouchableOpacity, TextInput, Dimensions} from 'react-native';
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useBottomSheet} from '../contexts/BottomSheetContext';
import {setFormData} from '../features/slices/chefbookingSlice';
import {useUpdateAddressMutation} from '../features/auth/authApiSlice';

const {width, height} = Dimensions.get('window');



const AddressPreview = ({navigation}) => {
  const {formData} = useSelector(state => state.chefBooking);
  const {user} = useSelector(state => state.user);
  let {customerLocation: address} = formData;
  const {openBottomSheet, closeBottomSheet} = useBottomSheet();


//   console.log("formData: ", formData);

  address = address ?? user?.user?.address;

  const handleNavigation = () => {
    closeBottomSheet();
    navigation.navigate('Map');
  };

  const handlePress = () => {
    openBottomSheet(
      <BottomSheetContent
        handleNavigation={handleNavigation}
        // addressType={addressType}
        // setAddressType={setAddressType}
        // formData={formData}
        // user={user}
        // dispatch={dispatch}
        closeBottomSheet={closeBottomSheet}
      />,
      ['25%', '50%'],
      'VIEWADDRESS',
    );
  };

  return (
    <TouchableOpacity onPress={handlePress} className="flex-row">
      <Text numberOfLines={1} ellipsizeMode="tail" className="max-w-[80vw]">
        <Text
          style={{fontFamily: 'Roboto Regular'}}
          className="font-bold text-black">
          {formData.customerInfo?.name || user?.user?.name}
        </Text>{' '}
        |{' '}
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={{fontFamily: 'Roboto Regular'}}
          className="text-gray-500">
       
          {address?.streetName ||
            address?.streetNumber ||
            address?.premise ||
            address?.sublocalityLevel2 ||
            address?.sublocalityLevel1 ||
            address?.location?.locationName ||
            ''}{' '}
          {''}
        </Text>
      </Text>

      <Ionicons name="chevron-down" size={20} color={'gray'} />
    </TouchableOpacity>
  );
};

export default AddressPreview;

const BottomSheetContent = ({closeBottomSheet, handleNavigation}) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.user);
  const {formData} = useSelector(state => state.chefBooking);

  let {customerLocation : address} = formData;
  
  address = address ?? user?.user?.address;

  // console.log('houseNumber: ', formData?.customerLocation?.houseNumber);

  // Validate that required fields in customerLocation and customerInfo are filled


  // On component mount, set customerInfo from user data.
  

  

  return (
    <View className="flex-1 p-5 bg-white">
      <Text className="text-xl font-bold mb-4 text-gray-800">
        Choose Your Address
      </Text>

      {/* Address Inputs */}
      <View style={{width: width*0.9}} className="rounded-2xl shadow-sm mx-auto">
        <TouchableOpacity onPress={handleNavigation} className="flex-row space-x-4 w-full items-center bg-white rounded-2xl">
          <View
            style={{elevation: 2}}
            className="border border-gray-300 bg-white rounded-lg p-2 items-center justify-center">
            <Ionicons name="paper-plane" size={30} color={'#ef4444'} />
          </View>
          <View style={{maxWidth: width*0.7}} className="flex-1">
            <Text className="text-black font-semibold text-lg">
              {user?.user?.name}
            </Text>
            <View style={{}} className="flex-row">
                <Text     className="">
                {address?.streetName ||
                    address?.streetNumber ||
                    address?.premise ||
                    address?.sublocalityLevel2 ||
                    address?.sublocalityLevel1 ||
                    address?.location?.locationName ||
                    ''}{' '},
                    {address?.city || ''}{' '},
                    {address?.state || ''}{' '}
                </Text>
              
            </View>
          </View>
          <View>
            <Ionicons name='chevron-forward' size={30} color={'gray'} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Save Address Button */}
      {/* <TouchableOpacity
        disabled={!checkValidation()}
        onPress={() => {
          
        }}
        className={`mt-6 py-4 rounded-2xl items-center shadow-md 
           'bg-red-500' `}>
        <Text className="text-white text-lg font-semibold">
          {isUpdatingAddress ? 'Saving...' : 'Save Address'}
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};

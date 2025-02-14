import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  moveToNextPage,
  setFormData,
} from '../../features/slices/chefbookingSlice';

const fields = [
  'city',
  'state',
  'postalCode',
  'area',
  'houseNumber',
  'landmark',
];

const customerInfoFields = ['fullName', 'phoneNumber', 'additionalPhoneNumber'];

const SecondPage = () => {
  const dispatch = useDispatch();
  const {formData} = useSelector(state => state.chefBooking);


  const formatLabel = field => {
    // Convert the field name to a readable format with spaces
    return field
      .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
      .replace(/^./, str => str); // Capitalize the first letter
  };

  const appendToForm = (field, subfield, value) => {
    dispatch(setFormData({field: field, subfield: subfield, value: value}));
  };

  console.log("formData2: ", formData)

  return (
    <ScrollView scrollEventThrottle={16} className="px-4 flex-1">
      <Text className=" text-xl text-gray-600 font-bold uppercase tracking-tighter py-4">
        where is the event
      </Text>
      <View className="mb-4">
        <Text className="mb-2 font-semibold text-gray-500">CITY</Text>
        <TextInput
          onChangeText={(text) => {appendToForm("customerLocation", "city", text)}}
          className="border border-gray-300 rounded-md p-3 focus:border-orange-500/60"
        />
      </View>
      <View className="flex-row justify-between mb-4">
        <View className="flex-1 mr-2">
          <Text className="mb-2 font-semibold text-gray-500">STATE</Text>
          <TextInput
          onChangeText={(text) => {appendToForm("customerLocation", "state", text)}}
          className="border border-gray-300 rounded-md p-3 focus:border-orange-500/60" />
        </View>
        <View className="flex-1 ml-2">
          <Text className="mb-2 font-semibold text-gray-500">POSTAL CODE</Text>
          <TextInput
            keyboardType="numeric"
            className="border border-gray-300 rounded-md p-3 focus:border-orange-500/60"
            onChangeText={(text) => {appendToForm("customerLocation", "postalCode", text)}}
          />
        </View>
      </View>
      {fields.map((field, index) => {
        // Check if the current field is 'state' or 'postalCode'
        if (field === 'state' || field === 'postalCode' || field === 'city') {
          return null; // Skip these fields in the regular mapping
        }

        // Render all fields except 'state' and 'postalCode'
        return (
          <View key={index} className="mb-4">
            <Text className="mb-2 font-semibold text-gray-500 uppercase">
              {formatLabel(field)}
            </Text>
            <TextInput
            onChangeText={(text) => {appendToForm("customerLocation", field, text)}}
            className="border border-gray-300 rounded-md p-3 focus:border-orange-500/60" />
          </View>
        );
      })}

      {/* Special layout for 'state' and 'postalCode' */}
      <Text className=" text-xl text-gray-600 font-bold uppercase tracking-tighter py-4">
        customer Information
      </Text>
      {customerInfoFields.map((item, index) => (
        <View key={index} className="mb-4">
          <Text className="mb-2 font-semibold text-gray-500 uppercase">
            {formatLabel(item)}
          </Text>
          <TextInput
          className="border border-gray-300 rounded-md p-3 focus:border-orange-500/60"
          onChangeText={(text) => {appendToForm("customerInfo", item, text)}}
           />
        </View>
      ))}

      <TouchableOpacity
        onPress={() => dispatch(moveToNextPage())}
        activeOpacity={0.5}
        className="bg-orange-500  mx-auto p-4 rounded-xl my-4">
        <Text className="text-2xl text-center text-white font-bold">NEXT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SecondPage;

import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePickerComponent from '../DatePicker';
import TimePickerComponent from '../TimePicker';
import {useDispatch, useSelector} from 'react-redux';
import {
  moveToNextPage,
  setFormData,
} from '../../../features/slices/chefbookingSlice';
import {Picker} from '@react-native-picker/picker';

const events = ['Breakfast', 'Lunch', 'Sancks', 'Dinner'];

const FirstPage = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [showInput, setShowInput] = useState(false);
  const {width, height} = Dimensions.get('window');
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();

  const appendToForm = (field, subfield, value) => {
    dispatch(setFormData({field: field, subfield: subfield, value: value}));
  };
  // console.log('formData: ', formData);
  


  return (
    <View style={{height: height}} className="relative">
      <View className="py-8">
        <Text className="px-4 text-xl text-gray-600 font-bold uppercase tracking-tighter">
          Type of the Event
        </Text>

        <View className="border mt-4 w-[95%] mx-auto border-gray-300 rounded-md">
          <Picker
            selectedValue={selectedEvent}
            onValueChange={itemValue => {
              if (itemValue === 'Others') {
                setShowInput(true);
                setSelectedEvent(''); // Clear dropdown selection for Others
              } else {
                setShowInput(false);
                setSelectedEvent(itemValue);
                dispatch(setFormData({field: 'eventType', value: itemValue}));
              }
            }}
            style={{color: selectedEvent ? 'black' : 'gray'}} // Gray for placeholder
            className="p-3">
            <Picker.Item label="Select an event" value="" color="gray" />
            <Picker.Item label="Marriage" value="Marriage" />
            <Picker.Item label="Anniversaries" value="Anniversaries" />
            <Picker.Item label="Birthdays" value="Birthdays" />
            <Picker.Item label="Others" value="Others" />
          </Picker>
        </View>

        {/* Show input only when "Others" is selected */}
        {showInput && (
          <View className="border mt-4 w-[95%] mx-auto border-gray-300 rounded-md p-3">
            <TextInput
              placeholder="Please specify the event"
              placeholderTextColor="gray"
              value={selectedEvent} // Using selectedEvent directly
              onChangeText={text => {
                setSelectedEvent(text);
                dispatch(setFormData({field: 'eventType', value: text}));
              }}
              className="text-black"
            />
          </View>
        )}
      </View>

      <View className="pb-8">
        <Text className="px-4 text-xl text-gray-600 font-bold uppercase tracking-tighter">
          Number of People
        </Text>
        <View className="items-center w-screen mt-4">
          <TextInput
            keyboardType="numeric"
            maxLength={5}
            onChangeText={text => {
              dispatch(setFormData({field: 'numberOfPeople', value: text}));
            }}
            className="border text-black w-[95%] border-gray-300 rounded-md p-3 focus:border-orange-500/60"
          />
        </View>
      </View>
      <View className="pb-8">
        {/* <DateTimePicker /> */}
        <Text className="px-4 text-xl text-gray-600 font-bold uppercase tracking-tighter">
          When is the event
        </Text>
        <View className="py-4">
          <DatePickerComponent />
          <TimePickerComponent />
        </View>
      </View>
      <View className=" mx-auto w-screen px-4 my-6">
        <TouchableOpacity
          onPress={() => {
            const {eventType, numberOfPeople, eventTimings} = formData;
            if(!eventType || !numberOfPeople || !eventTimings) {
              Alert.alert("Fill the values");
              return;
            }
            dispatch(moveToNextPage())}}
          activeOpacity={0.5}
          className="bg-orange-500  mx-auto p-4 rounded-xl">
          <Text className="text-2xl text-center text-white font-bold">
            NEXT
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FirstPage;

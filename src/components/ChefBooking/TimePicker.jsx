import React, {useState} from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { setFormData } from '../../features/slices/chefbookingSlice';

const TimePickerComponent = () => {
  const [startTime, setStartTime] = useState(new Date());
  const [startTimeOpen, setStartTimeOpen] = useState(false);

  const [endTime, setEndTime] = useState(new Date());
  const [endTimeOpen, setEndTimeOpen] = useState(false);


  const dispatch = useDispatch();

  return (
    <View className="my-6" style={styles.container}>
      <View className="flex-row w-screen space-x-12 max-w-md justify-center">
        <TouchableOpacity
          className={`justify-center relative rounded-xl px-4 py-1 border ${
            startTime ? 'border-orange-500/80 border-2' : ''
          } w-[40%]`}
          onPress={() => setStartTimeOpen(true)}>
          {startTime ? (
            <View className="flex-row space-x-2 items-center">
              <Ionicons name="time-outline" size={18} />
              <View>
                <Text className="text-[12px] font-semibold text-orange-400">
                  Start Time
                </Text>
                <Text className="text-xl">
                  {startTime.getHours()}:
                  {String(startTime.getMinutes()).padStart(2, '0')}
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-black"> Start Time</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className={`justify-center rounded-xl px-4 py-1 border ${
            endTime ? 'border-orange-500/80 border-2' : ''
          } w-[40%]`}
          onPress={() => setEndTimeOpen(true)}>
          {endTime ? (
            <View className="flex-row space-x-2 items-center">
            <Ionicons name="time-outline" size={18} />
            <View>
              <Text className="text-[12px] text-orange-400 font-semibold">
                End Time
              </Text>
              <Text className="text-xl">
                {endTime.getHours()}:
                {String(endTime.getMinutes()).padStart(2, '0')}
              </Text>
            </View>
            </View>
          ) : (
            <Text className="text-black"> End Time</Text>
          )}
        </TouchableOpacity>
      </View>
      <DatePicker
        modal
        open={startTimeOpen}
        date={startTime}
        mode="time" // Only time selection
        onConfirm={selectedTime => {
          setStartTimeOpen(false);
          setStartTime(selectedTime);

          const formattedTime = selectedTime.toTimeString().split(' ')[0]; 
          
          dispatch(
            setFormData({
              field: 'eventTimings',
              subfield: 'startTime',
              value: formattedTime,
            }),
          );

        }}
        onCancel={() => {
          setStartTimeOpen(false);
        }}
      />
      <DatePicker
        modal
        open={endTimeOpen}
        date={endTime}
        mode="time" // Only time selection
        onConfirm={selectedTime => {
          setEndTimeOpen(false);
          setEndTime(selectedTime);

          const formattedTime = selectedTime.toTimeString().split(' ')[0]; 
          
          dispatch(
            setFormData({
              field: 'eventTimings',
              subfield: 'endTime',
              value: formattedTime,
            }),
          );
        }}
        onCancel={() => {
          setEndTimeOpen(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTime: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default TimePickerComponent;

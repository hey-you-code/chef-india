import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import CalendarComponent from './CalendarComponent';
import {useDispatch, useSelector} from 'react-redux';
import {setFormData} from '../features/slices/chefbookingSlice';

const {width: screenWidth} = Dimensions.get('window');

const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Full Day'];

const DateTimeSelector = ({onNext}) => {
  const dispatch = useDispatch();
  const {formData, bookingType} = useSelector(state => state.chefBooking);

  // Instead of using local state for dates/times, we read them from global state.
  // formData.eventTimings is updated by the CalendarComponent and DatePickers.
  const eventTimings = formData.eventTimings || {};
  const selectedDate = eventTimings.startDate; // set by CalendarComponent
  const selectedStartTime = eventTimings.startTime || new Date();
  const selectedEndTime = eventTimings.endTime || new Date();

  // currentTab: 0 = Calendar, 1 = Start Time, 2 = End Time
  const [currentTab, setCurrentTab] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  // Helper to update Redux state for time selections.
  const appendToForm = (field, subfield, value) => {
    dispatch(setFormData({field, subfield, value}));
  };

  const handleSelect = slot => {
    const formattedSlot = slot.toLowerCase().replace(/\s+/g, '');
    appendToForm('eventTimings', 'timeSlots', [formattedSlot]);
  };

  const handleStartTimeChange = newTime => {
    appendToForm('eventTimings', 'startTime', newTime);
  };

  const handleEndTimeChange = newTime => {
    appendToForm('eventTimings', 'endTime', newTime);
  };

  // Navigation between tabs with a sliding animation.
  const goToNextTab = () => {
    if (currentTab === 0 && selectedDate) {
      Animated.timing(translateX, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setCurrentTab(1));
    } else if (currentTab === 1) {
      Animated.timing(translateX, {
        toValue: -screenWidth * 2,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setCurrentTab(2));
    } else if (currentTab === 2) {
      if (onNext) {
        onNext();
      }
    }
  };

  const goToPreviousTab = () => {
    if (currentTab === 1) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setCurrentTab(0));
    } else if (currentTab === 2) {
      Animated.timing(translateX, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setCurrentTab(1));
    }
  };

  // console.log("selected: ", formData?.eventTimings?.timeSlots[0])

  return (
    <View style={styles.container}>
      <View style={styles.tab}>
        {/* CalendarComponent now uses global state; no props needed */}
        <CalendarComponent />

        {formData?.bookingType !== 'regular' && (
          <View className="flex-row justify-between space-x-2 pt-3 rounded-xl">
            {timeSlots.map((slot, index) => {
              const formattedSlot = slot.toLowerCase().replace(/\s+/g, '');
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelect(slot)}
                  className={`flex-1 py-2  rounded-md items-center justify-center ${
                    formData?.eventTimings?.timeSlots?.includes(formattedSlot)
                      ? 'bg-black'
                      : 'bg-gray-200'
                  }`}>
                  <Text
                    className={`text-xs font-semibold ${
                      formData?.eventTimings?.timeSlots?.includes(formattedSlot)
                        ? 'text-white'
                        : 'text-black'
                    }`}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.buttonContainer}>
          {formData?.bookingType === 'regular' ? (
            <TouchableOpacity
              onPress={onNext}
              disabled={!selectedDate}
              style={[
                styles.nextButton,
                !selectedDate && styles.disabledButton,
              ]}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onNext}
              disabled={!selectedDate || !eventTimings['timeSlots']}
              style={[
                styles.nextButton,
                (!selectedDate || !eventTimings['timeSlots']) &&
                  styles.disabledButton,
              ]}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  animatedContainer: {
    flexDirection: 'row',
  },
  tab: {
    width: screenWidth,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePicker: {
    width: screenWidth * 0.8,
    height: 150,
    marginVertical: 20,
    // backgroundColor: '#e5e7eb', // Red background
    borderRadius: 10, // Optional rounded corners
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  backButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
});

export default DateTimeSelector;

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import CalendarComponent from './CalendarComponent';
import {useDispatch, useSelector} from 'react-redux';
import {setFormData} from '../features/slices/chefbookingSlice';

const {width: screenWidth} = Dimensions.get('window');

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

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            width: screenWidth * (formData?.bookingType === 'regular' ? 1 : 3),
            transform: [{translateX}],
          },
        ]}>
        {/* Tab 1: Calendar */}
        <View style={styles.tab}>
          {/* CalendarComponent now uses global state; no props needed */}
          <CalendarComponent />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={
                formData?.bookingType === 'regular' ? onNext : goToNextTab
              }
              disabled={!selectedDate}
              style={[
                styles.nextButton,
                !selectedDate && styles.disabledButton,
              ]}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>

        {formData?.bookingType !== 'regular' && (
          <>
            {/* Tab 2: Start Time */}
            <View style={styles.tab}>
              <Text style={styles.title}>Select Start Time</Text>
              <DatePicker
                date={selectedStartTime}
                onDateChange={handleStartTimeChange}
                mode="time"
                style={[styles.datePicker]} // Red background
                textColor="#00" // White text for contrast
                theme="light" // Ensures light theme (if supported by library)
                // For Android spinner style:
                is24hourSource="device"
                dividerHeight={1}
                // dividerColor="#ff0000"
                // For iOS:
                modalProps={{
                  buttonTextColorIOS: '#ff0000',
                  headerTextColor: '#ff0000',
                }}
              />
              <View className="space-x-6" style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={goToPreviousTab}
                  style={styles.backButton}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={goToNextTab}
                  style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tab 3: End Time */}
            <View style={styles.tab}>
              <Text  style={styles.title}>Select End Time</Text>
              <DatePicker
                date={selectedEndTime}
                onDateChange={handleEndTimeChange}
                mode="time"
                style={[styles.datePicker]} // Red background
                textColor="#000" // White text for contrast
                theme="light" // Ensures light theme (if supported by library)
                // For Android spinner style:
                is24hourSource="device"
                dividerHeight={1}
                // dividerColor="#ff0000"
                // For iOS:
                modalProps={{
                  buttonTextColorIOS: '#ff0000',
                  headerTextColor: '#ff0000',
                }}
              />
              <View className="space-x-6" style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={goToPreviousTab}
                  style={styles.backButton}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={goToNextTab}
                  style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>Finish</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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

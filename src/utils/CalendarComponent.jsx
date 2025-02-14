import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { setFormData } from '../features/slices/chefbookingSlice';

// Helper functions to get dates in local format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const day = ('0' + today.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = ('0' + (tomorrow.getMonth() + 1)).slice(-2);
  const day = ('0' + tomorrow.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

const CalendarComponent = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.chefBooking);
  // Retrieve the eventTimings (startDate and endDate) from global state.
  const { startDate, endDate } = formData?.eventTimings || {};

  // Update the global state with the new eventTimings.
  const updateEventTimings = (start, end) => {
    dispatch(
      setFormData({
        field: 'eventTimings',
        value: { startDate: start, endDate: end },
      })
    );
  };

  // When a day is pressed:
  // - If no startDate or a full range is already selected, set the pressed day as the new startDate.
  // - Otherwise, if the pressed day is after the current startDate, set it as the endDate.
  // - If the pressed day is before (or equal to) the startDate, restart the selection.
  const handleDayPress = (day) => {
    if (!startDate || (startDate && endDate)) {
      updateEventTimings(day.dateString, null);
    } else {
      if (new Date(day.dateString) > new Date(startDate)) {
        updateEventTimings(startDate, day.dateString);
      } else {
        updateEventTimings(day.dateString, null);
      }
    }
  };

  // Build markedDates using "period" marking so the selection appears as one continuous strip.
  const getMarkedDates = () => {
    let markedDates = {};

    if (startDate && !endDate) {
      // For a single date selection, mark it as both the starting and ending day.
      markedDates[startDate] = {
        startingDay: true,
        endingDay: true,
        color: 'black',
        textColor: 'white',
      };
    }

    if (startDate && endDate) {
      // For a range selection, mark all dates between startDate and endDate.
      let currentDate = new Date(startDate);
      const lastDate = new Date(endDate);
      while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        if (dateString === startDate) {
          markedDates[dateString] = {
            startingDay: true,
            color: 'black',
            textColor: 'white',
          };
        } else if (dateString === endDate) {
          markedDates[dateString] = {
            endingDay: true,
            color: 'black',
            textColor: 'white',
          };
        } else {
          markedDates[dateString] = {
            color: 'black',
            textColor: 'white',
          };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Mark today's date as disabled.
    const today = getTodayDate();
    markedDates[today] = {
      disabled: true,
      disableTouchEvent: true,
      customStyles: {
        text: { color: '#d9e1e8' },
      },
    };

    return markedDates;
  };

  const minDate = getTomorrowDate();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>When do you wanna book?</Text>
      <Calendar
        markingType="period"
        minDate={minDate}
        onDayPress={handleDayPress}
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: 'white',
          calendarBackground: 'white',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: 'black',
          selectedDayTextColor: '#ffffff',
          todayTextColor: 'black',
          dayTextColor: 'black',
          textDisabledColor: '#d9e1e8',
          monthTextColor: 'black',
          arrowColor: 'black',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CalendarComponent;

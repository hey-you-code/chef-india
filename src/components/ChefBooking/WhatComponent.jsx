import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setFormData} from '../../features/slices/chefbookingSlice';

const WhatComponent = ({onNext}) => {
  const [activeTab, setActiveTab] = useState('breakfast');
  const [selectedSpecial, setSelectedSpecial] = useState(null);
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();

  const bookingType = formData?.bookingType;
  const tabs = ['breakfast', 'lunch', 'dinner'];
  const specialOptions = ['Marriage', 'Birthday', 'Anniversary', 'Other'];

  useEffect(() => {
    setActiveTab('breakfast');
    setSelectedSpecial(null);
  }, [bookingType]);

  // Mapping meal types to time slots
  const timeSlotMapping = {
    breakfast: 'morning',
    lunch: 'afternoon',
    dinner: 'evening',
  };

  // Update `timeSlots` in `eventTimings` dynamically
  useEffect(() => {
    if (bookingType !== 'regular') return;

    let updatedTimeSlots = [];

    tabs.forEach(mealType => {
      if (formData?.eventType?.[mealType]?.numberOfItems > 0) {
        updatedTimeSlots.push(timeSlotMapping[mealType]);
      }
    });

    dispatch(
      setFormData({
        field: 'eventTimings',
        subfield: 'timeSlots',
        value: updatedTimeSlots,
      }),
    );
  }, [formData?.eventType, bookingType]);

  // console.log("formData: ", formData);

  const counterValue = formData?.eventType?.[activeTab]?.numberOfItems ?? 0;

  const handleRegularCounter = operation => {
    const newValue =
      operation === 'increment'
        ? counterValue + 1
        : Math.max(counterValue - 1, 0);

    dispatch(
      setFormData({
        field: 'eventType',
        subfield: activeTab,
        subfield2: 'numberOfItems',
        value: newValue,
      }),
    );
  };

  const handleSpecialSelection = option => {
    setSelectedSpecial(option);
    dispatch(setFormData({field: 'eventType', value: option}));
  };

  if (bookingType === 'regular') {
    return (
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.counterContainer}>
          <Text style={styles.counterLabel}>Number of Items</Text>
          <View style={styles.counterControls}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleRegularCounter('decrement')}>
              <Text style={styles.counterButtonText}>–</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{counterValue}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleRegularCounter('increment')}>
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (bookingType === 'special' || bookingType === 'catering') {
    return (
      <View style={styles.container}>
        <Text style={styles.specialHeader}>What is the Event Type ?</Text>
        <View style={styles.specialGrid}>
          {specialOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.specialOption,
                selectedSpecial === option && styles.specialOptionSelected,
              ]}
              onPress={() => handleSpecialSelection(option)}>
              <Text
                style={[
                  styles.specialOptionText,
                  selectedSpecial === option &&
                    styles.specialOptionTextSelected,
                ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Please select a booking type first</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    width: 350,
    alignSelf: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
  counterContainer: {
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  counterValue: {
    fontSize: 20,
    color: '#333',
  },
  specialHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    paddingLeft: 10
  },
  specialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  specialOption: {
    width: '45%',
    paddingVertical: 15,
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialOptionSelected: {
    backgroundColor: '#000',
  },
  specialOptionText: {
    fontSize: 16,
    color: '#333',
  },
  specialOptionTextSelected: {
    color: '#fff',
  },
});

export default WhatComponent;

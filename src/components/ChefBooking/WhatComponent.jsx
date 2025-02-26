import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setFormData} from '../../features/slices/chefbookingSlice';

const WhatComponent = ({onNext}) => {
  // Declare ALL hooks at the top unconditionally
  const [activeTab, setActiveTab] = useState('breakfast');
  const [selectedSpecial, setSelectedSpecial] = useState(null);
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();

  // Get booking type once at the top
  const bookingType = formData?.bookingType;
  const tabs = ['breakfast', 'lunch', 'snacks', 'dinner'];
  const specialOptions = ['Marriage', 'Birthday', 'Anniversary', 'Other'];

  // Reset states when bookingType changes
  useEffect(() => {
    setActiveTab('breakfast');
    setSelectedSpecial(null);
  }, [bookingType]);

  // Regular booking logic
  const counterValue = formData?.eventType?.[activeTab]?.numberOfItems ?? 0;

  const handleRegularCounter = (operation) => {
    const newValue = operation === 'increment' ? counterValue + 1 : Math.max(counterValue - 1, 0);
    dispatch(
      setFormData({
        field: 'eventType',
        subfield: activeTab,
        subfield2: 'numberOfItems',
        value: newValue,
      })
    );
  };

  // Special booking logic
  const handleSpecialSelection = (option) => {
    setSelectedSpecial(option);
    dispatch(setFormData({ field: 'eventType', value: option }));
  };

  // Conditional rendering based on booking type
  if (bookingType === 'regular') {
    return (
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
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
        <Text style={styles.specialHeader}>Select Event Type</Text>
        <View style={styles.specialGrid}>
          {specialOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.specialOption,
                selectedSpecial === option && styles.specialOptionSelected,
              ]}
              onPress={() => handleSpecialSelection(option)}>
              <Text style={[
                styles.specialOptionText,
                selectedSpecial === option && styles.specialOptionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Fallback for unknown booking types
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
    // height: "fill"
  },
  // Regular booking styles:
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
  // Special booking styles:
  specialHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  specialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  specialOption: {
    width: '45%',
    paddingVertical: 20,
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

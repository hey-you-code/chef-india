import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setFormData} from '../../features/slices/chefbookingSlice';

const WhatComponent = ({onNext}) => {
  // Access global formData from Redux.
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();

  // Get booking type from the formData
  const bookingType = formData?.bookingType;

  // If booking type is "regular", display the existing tabs + counter UI.
  if (bookingType === 'regular') {
    const [activeTab, setActiveTab] = useState('breakfast');
    const tabs = ['breakfast', 'lunch', 'snacks', 'dinner'];
    // Derive the counter value for the active tab from global state. Default to 0 if not defined.
    const counterValue = formData?.eventType?.[activeTab]?.numberOfItems ?? 0;

    const increment = () => {
      const newValue = counterValue + 1;
      dispatch(
        setFormData({
          field: 'eventType',
          subfield: activeTab,
          subfield2: 'numberOfItems',
          value: newValue,
        }),
      );
    };

    const decrement = () => {
      const newValue = Math.max(counterValue - 1, 0);
      dispatch(
        setFormData({
          field: 'eventType',
          subfield: activeTab,
          subfield2: 'numberOfItems',
          value: newValue,
        }),
      );
    };

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
            <TouchableOpacity style={styles.counterButton} onPress={decrement}>
              <Text style={styles.counterButtonText}>–</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{counterValue}</Text>
            <TouchableOpacity style={styles.counterButton} onPress={increment}>
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // For "special" booking, show a grid with four options.
  else if (bookingType === 'special') {
    const specialOptions = ['Marriage', 'Birthday', 'Anniversary', 'Other'];
    const [selectedSpecial, setSelectedSpecial] = useState(null);

    const handleSelectOption = option => {
      setSelectedSpecial(option);
      // For a special booking, we update eventType directly with the chosen option.
      dispatch(
        setFormData({
          field: 'eventType',
          value: option,
        }),
      );
    };

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
              onPress={() => handleSelectOption(option)}>
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

  // If booking type is neither "regular" nor "special", show a default message.
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

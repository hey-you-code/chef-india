import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setFormData} from '../../features/slices/chefbookingSlice';

const {width: screenWidth} = Dimensions.get('window');

const WhosComingComponent = ({}) => {
  const dispatch = useDispatch();
  const {formData, bookingType} = useSelector(state => state.chefBooking);

  const numberOfGuests = formData?.numberOfGuests || 0; // Default to 1 if undefined

  const updateGuests = newValue => {
    dispatch(setFormData({field: 'numberOfGuests', value: newValue}));
  };



  return (
    <View style={{width: 350}} className="p-[20px]">
      <Text style={styles.title}>Who’s coming?</Text>

      <View className="flex-row my-4 w-[320px] justify-between">
        <View>
          <Text style={styles.label}>People</Text>
          <Text style={styles.subLabel}>Total guests</Text>
        </View>
        {formData?.bookingType === 'regular' ? (
          <View style={styles.counterControls}>
            <TouchableOpacity
              className="h-[40px] w-[40px] items-center justify-center border border-[#eee] rounded-full"
              onPress={() => updateGuests(Math.max(0, numberOfGuests - 1))} // Ensure min 1
            >
              <Text className="text-center text-[28px] leading-[32px]">-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{numberOfGuests}</Text>
            <TouchableOpacity
              className="h-[40px] w-[40px] items-center justify-center border border-[#eee] rounded-full"
              onPress={() => updateGuests(numberOfGuests + 1)}>
              <Text className="text-center text-[22px] leading-[28px]">+</Text>
            </TouchableOpacity>
          </View>
        ) : undefined}
        {formData?.bookingType === 'special' || formData?.bookingType === 'catering' ? (
          <View style={styles.counterControls}>
            <TextInput
              onChangeText={text => {
                updateGuests(text);
              }}
              // keyboardType="numeric"
              keyboardType='numeric'
              maxLength={5}
              placeholder='Ex: 500'
              placeholderTextColor={"gray"}
              className="border px-4 rounded-xl w-[100px] text-black"
            />
          </View>
        ) : undefined}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => updateGuests(0)}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={onNext} style={styles.nextButton}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subLabel: {
    fontSize: 12,
    color: '#888',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 18,
    marginHorizontal: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearText: {
    color: 'black',
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  nextText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WhosComingComponent;

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DatePicker from "react-native-date-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { setFormData } from "../../features/slices/chefbookingSlice";

const DatePickerComponent = () => {
  const [date, setDate] = useState(new Date()); // Selected date
  const [open, setOpen] = useState(false); // Modal visibility
  const { formData } = useSelector((state) => state.chefBooking);
  const dispatch = useDispatch();

  // Get tomorrow's date (exactly at 00:00 hours)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Ensure it's the start of the day

  return (
    <View className="px-4" style={styles.container}>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row space-x-2 items-center py-1"
      >
        <Ionicons name="calendar-clear-outline" size={24} color={"#f97316"} />
        <Text className="text-xl font-semibold text-black/60">
          {date?.toDateString()}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        minimumDate={new Date("2025-01-28")} // Restrict selection to tomorrow only
        // maximumDate={tomorrow} // Prevent selecting any other date
        onConfirm={(selectedDate) => {
          setOpen(false);
          setDate(selectedDate);

          dispatch(
            setFormData({
              field: "eventTimings",
              subfield: "eventDate",
              value: selectedDate.toISOString(),
            })
          );
        }}
        onCancel={() => setOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
});

export default DatePickerComponent;

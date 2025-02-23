import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const CustomBottomSheet = ({ children }) => {
  // Ref for the bottom sheet
  const bottomSheetRef = useRef(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['20%', '100%'], []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0} // Initial snap point index
          snapPoints={snapPoints}
          backgroundStyle={styles.background} // White background
          handleStyle={styles.handle} // Black handle
          handleIndicatorStyle={styles.handleIndicator} // Black indicator
        >
          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Pass any custom component here */}
            {children}
          </ScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: 300,
    backgroundColor: '#000', // Black background for the rest of the screen
  },
  background: {
    backgroundColor: '#FFF', // White background for the bottom sheet
    borderRadius: 20, // Rounded corners
  },
  handle: {
    backgroundColor: '#FFF', // White handle background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#000', // Black handle indicator
    width: 40,
    height: 4,
  },
  contentContainer: {
    padding: 16, // Padding for the content
  },
});

export default CustomBottomSheet;
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {View, StyleSheet, Text, Keyboard, TextInput} from 'react-native';
import { Easing } from 'react-native-reanimated';

// Define types for context
interface BottomSheetContextProps {
  openBottomSheet: (
    newContent: ReactNode,
    newSnapPoints?: Array<string | number>,
    newType? : string,
    newHeader?: ReactNode,
    newFooter?: ReactNode,
  ) => void;
  updateCommentsComponent: (newComments?: ReactNode) => void;
  // setBottomSheetFooter : (newFooter?: ReactNode) => void;
  closeBottomSheet: () => void;
  isBottomSheetOpen: boolean;
  bottomSheetType : string,
}

// Create the BottomSheetContext with type or null initially
const BottomSheetContext = createContext<BottomSheetContextProps | null>(null);

// Custom hook for accessing the BottomSheet context
export const useBottomSheet = (): BottomSheetContextProps => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};

// Define the provider's props type
interface BottomSheetProviderProps {
  children: ReactNode;
}

export const BottomSheetProvider: React.FC<BottomSheetProviderProps> = ({
  children,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [snapPoints, setSnapPoints] = useState<Array<string | number>>([
    '50%'
  ]);
  const [bottomSheetContent, setBottomSheetContent] = useState<ReactNode>(null);
  const [bottomSheetHeader, setBottomSheetHeader] = useState<ReactNode>(null);
  const [bottomSheetFooter, setBottomSheetFooter] = useState<ReactNode>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [bottomSheetType, setBottomSheetType] = useState<string>("")

  // Function to open the BottomSheet with content, snapPoints, and custom header
  const openBottomSheet = ( newContent: ReactNode = null,
    newSnapPoints: Array<string | number> = snapPoints,
    newType: string = "",
    newHeader: ReactNode = null,
    newFooter: ReactNode = null,

  ) => {
    setBottomSheetType(newType);
    setBottomSheetContent(newContent);
    setSnapPoints(newSnapPoints);
    setBottomSheetHeader(newHeader);
    setBottomSheetFooter(newFooter);
    bottomSheetRef.current?.expand();
    setIsBottomSheetOpen(true);
  };

  const arraysAreEqual = (arr1: Array<any>, arr2: Array<any>) => {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
  };

  // Function to close the BottomSheet
  const closeBottomSheet = () => {
    // Close the bottom sheet
    bottomSheetRef.current?.close();
  
    // Only update state if necessary to avoid triggering re-renders
    if (isBottomSheetOpen) {
      setIsBottomSheetOpen(false);
    }
  
    // Reset the type and snap points only if they are not already reset
    if (bottomSheetType !== "") {
      setBottomSheetType("");
    }
  
    // Check if snapPoints need to be reset to avoid re-renders
    if (!arraysAreEqual(snapPoints, ['50%'])) {
      setSnapPoints(['50%']);
      }

  };
  

  // Dismiss the keyboard early when the bottom sheet is dragged
  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      Keyboard.dismiss(); // Close the keyboard when the bottom sheet is dismissed
    }
  };

  const handleSheetAnimate = () => {
    Keyboard.dismiss();
  };

  const updateCommentsComponent = (newComments: ReactNode) => {
    setBottomSheetContent(newComments);
  };

  // Render backdrop with custom opacity
  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={1}
      opacity={0.4}
    />
  );

  const renderFooter = (props: any) => (
    <BottomSheetFooter {...props} bottomInset={0}>
      {bottomSheetFooter}
    </BottomSheetFooter>
  );

  return (
    <BottomSheetContext.Provider
      value={{
        openBottomSheet,
        closeBottomSheet,
        isBottomSheetOpen,
        updateCommentsComponent,
        bottomSheetType,
      }}>
      {children}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        style={styles.bottomSheet}
        enablePanDownToClose={true}
        footerComponent={renderFooter}
        index={-1}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        // onChange={handleSheetChanges}
        animateOnMount={true}           
        // animationEasing={Easing.out(Easing.exp)} // Easing for smooth animation
        onAnimate={handleSheetAnimate}
        onClose={closeBottomSheet}
      >
        <View style={styles.container}>
          {bottomSheetHeader && (
            <View style={styles.header}>{bottomSheetHeader}</View>
          )}



          <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}> 
          {bottomSheetContent}
           <View style={{height: 50}} />
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
     
    </BottomSheetContext.Provider>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    zIndex: 9999,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 8,
    borderBottomWidth: 1,
    alignItems: 'center',
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  scrollContainer: {
    // padding: 20,
  },
});

export default BottomSheetProvider;
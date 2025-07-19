import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import logo from '../../../assets/logo.png';
import {ImageBackground} from 'react-native';
import welcomepage from '../../../assets/welcomepage.png';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth_logo from '../../../assets/auth_logo.png';
import login_screen from '../../../assets/login_screen.png';
import name_screen from '../../../assets/name_screen.png';
import otp_screen from '../../../assets/otp_screen.png';
import PhoneInput from 'react-native-phone-number-input';
import OTPTextView from 'react-native-otp-textinput';
import {
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '../../features/auth/authApiSlice';
import {useDispatch} from 'react-redux';
import {setUser} from '../../features/slices/userSlice';

const AuthScreen = ({navigation}) => {
  const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');
  const [tab, setTab] = useState(0);
  const [countryCode, setCountryCode] = useState('IN');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedValue, setFormattedValue] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    let interval;
    if (resendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false); // Enable the resend button
    }
    return () => clearInterval(interval);
  }, [timer, resendDisabled]);

  const handleResendOtp = async () => {
    console.log('Resending OTP...');
    setTimer(30); // Reset timer
    setResendDisabled(true); // Disable the resend button

    try {
      const response = await sendOtp({
        phoneNumber: formattedValue,
      }).unwrap();

      // console.log('OTP resent successfully:', response);
    } catch (error) {
      Alert.alert('Error while sending otp');
      console.log('Error while resending otp: ', error);
    }
  };

  const [
    sendOtp,
    {
      isLoading: isOtpSending,
      isError: otpSendingError,
      isSuccess: otpSendingSuccess,
    },
  ] = useSendOtpMutation();

  const [
    verifyOtp,
    {isLoading: isVerifying, isError: isVerifiedError, isSuccess: isVerified},
  ] = useVerifyOtpMutation();

  const [
    register,
    {
      isLoading: isRegistering,
      isError: isRegsiteringError,
      isSuccess: isRegistered,
    },
  ] = useRegisterMutation();

  const handleSendOtp = async () => {
    try {
      if (!formattedValue) {
        console.log('Phone Number is required!');
        return;
      }

      const response = await sendOtp({
        phoneNumber: formattedValue,
      }).unwrap();

      // console.log(response); 
      setTab(tab => tab + 1);
    } catch (error) {
      console.log('error while sending otp: ', error);
    }
  };

  const handleOtpVerification = async () => {
    try {
      if (!otp || !formattedValue) {
        console.error('Phone number and OTP are required!');
        return;
      }

      const response = await verifyOtp({
        phoneNumber: formattedValue,
        otp,
      }).unwrap();

      if (response?.data?.otpVerified === false) {
        Alert.alert('OTP did not match!');
      }

      if (response.data?.userExists === true) {
        // login
        dispatch(
          setUser({
            user: response?.data?.user,
            accessToken: response?.data?.accessToken,
          }),
        );
      } else {
        console.log('register now');
        setTab(tab => tab + 1);
      }
    } catch (error) {
      console.log('Error while verifying otp: ', error);
    }
  };

  const handleRegister = async () => {
    try {
      if (!formattedValue || !name) {
        console.log('Phone Number and name is required');
      }

      const response = await register({
        phoneNumber: formattedValue,
        name,
      }).unwrap();

      if (response.data?.userCreated === true) {
        // set the user
        dispatch(
          setUser({
            user: response?.data?.user,
            accessToken: response?.data?.accessToken,
          }),
        );
      }
    } catch (error) {
      console.log('Error while loggin in: ', error);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}} className="bg-[#FF3130]">
      {/*  */}
      <StatusBar
        translucent={false}
        backgroundColor={'#FF3130'}
        barStyle={'light-content'}
      />
      <View className={tab === 0 ? 'absolute z-10 px-4' : ' z-10 px-4'} style={tab === 0 && Platform.OS === 'ios' && {top: 50}}>
        <TouchableOpacity
          onPress={() => {
            if (tab === 0) {
              navigation.goBack();
              return;
            }

            setTab(tab - 1);
          }}
          className="flex-row space-x-2 items-center  pr-3">
          <Octicons name="chevron-left" size={40} color={'white'} />
          <Text className="text-[22px] font-semibold  text-white">Back</Text>
        </TouchableOpacity>
      </View>

      {tab === 0 ? (
        <ImageBackground
          source={welcomepage}
          resizeMode="contain"
          className=""
          style={{flex: 1, height: HEIGHT}}>
          <View style={{height: HEIGHT * 0.87}} className="justify-end">
            <TouchableOpacity
              onPress={() => setTab(tab + 1)}
              style={{width: WIDTH * 0.9}}
              className="bg-black mx-auto flex-row items-center justify-center rounded-[16px] h-[70px] px-4">
              <View className="flex-row items-center space-x-3">
                <Text className="text-white font-medium text-2xl">
                  Get Started
                </Text>
                <Ionicons name="arrow-forward" color={'white'} size={32} />
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      ) : undefined}

      {tab === 1 ? (
        <ImageBackground
          source={login_screen}
          resizeMode="cover"
          className="flex-1"
          style={{height: HEIGHT}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                className=""
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  paddingBottom: 30,
                }}>
                <PhoneInput
                  defaultCode={countryCode}
                  layout="first"
                  containerStyle={styles.phoneInputContainer}
                  textContainerStyle={styles.textContainer}
                  textInputStyle={styles.textInput}
                  codeTextStyle={{fontSize: 20}}
                  onChangeFormattedText={text => setFormattedValue(text)}
                  onChangeText={text => {
                    if (/^\d*$/.test(text) && text.length <= 10) {
                      setPhoneNumber(text);
                    }
                  }}
                  placeholder="Mobile Number"
                  textInputProps={{
                    placeholderTextColor: 'gray',
                    maxLength: 10,
                  }}
                />

                <TouchableOpacity
                  onPress={handleSendOtp}
                  style={{width: WIDTH * 0.9}}
                  className="bg-black mx-auto flex-row items-center justify-center rounded-[16px] h-[70px] px-4 mt-4">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-white font-medium text-2xl">
                      {isOtpSending ? 'Sending' : 'Send OTP'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </ImageBackground>
      ) : undefined}

      {tab === 2 ? (
        <ImageBackground
          source={otp_screen}
          resizeMode="cover"
          className="flex-1"
          style={{height: HEIGHT}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                className="items-center"
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  paddingBottom: 30,
                }}>
                <View
                  style={{width: WIDTH * 0.9}}
                  className="mx-auto items-center justify-center">
                  <OTPTextView
                    handleTextChange={text => setOtp(text)}
                    tintColor={'black'}
                    textInputStyle={{
                      backgroundColor: 'white',
                      borderRadius: 6,
                      borderWidth: 2,
                      borderBottomWidth: 2,
                      color: 'black',
                    }}
                    inputCount={6}
                  />
                </View>

                <View className="flex-row justify-center my-6">
                  {resendDisabled ? (
                    <Text className="text-lg text-white">
                      Resend OTP in {timer}s
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp}>
                      <Text className="text-white text-lg">Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleOtpVerification}
                  style={{width: WIDTH * 0.9}}
                  disabled={otp === ""}
                  className={` mx-auto flex-row items-center justify-center rounded-[16px] h-[70px] px-4 mt-4 ${
                    otp === "" ? 'bg-gray-400' : 'bg-black'
                  }`}>
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-white font-medium text-2xl">
                      Verify
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </ImageBackground>
      ) : undefined}

      {tab === 3 ? (
        <ImageBackground
          source={name_screen}
          resizeMode="cover"
          className="flex-1"
          style={{height: HEIGHT}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                className="space-y-6"
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  paddingBottom: 30,
                }}>
                <View style={{width: WIDTH * 0.9}} className="mx-auto">
                  <TextInput
                    value={name}
                    onChangeText={text => setName(text)}
                    placeholder="Your Name"
                    placeholderTextColor={'gray'}
                    className="h-[70px] bg-white text-black rounded-[16px] text-xl px-4"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleRegister}
                  style={{width: WIDTH * 0.9}}
                  className="bg-black mx-auto flex-row items-center justify-center rounded-[16px] h-[70px] px-4 mt-4">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-white font-medium text-2xl">
                      {isRegistering ? 'Logging in...' : 'Register'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </ImageBackground>
      ) : undefined}
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  phoneInputContainer: {
    backgroundColor: 'white',
    width: '90%',
    // borderBottomWidth: 0,
    height: 70,
    marginHorizontal: 'auto',
    borderRadius: 16,
  },
  textContainer: {
    backgroundColor: 'transparent',
    height: 70,
  },
  textInput: {
    backgroundColor: 'transparent',
    fontSize: 25,
    color: 'black',
    height: 70,
  },
});
import {SafeAreaView, StatusBar, Text, View} from 'react-native';
import {Provider} from 'react-redux';
import {store} from './src/features/store/store';
import Router from './src/navigation/Router';


const App = () => {
  return (

      <Provider store={store}>
        <Router />
      </Provider>

  );
};

export default App;

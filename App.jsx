// import { LogBox, ErrorUtils } from 'react-native';
import {Provider} from 'react-redux';
import {store} from './src/features/store/store';
import Router from './src/navigation/Router';

// ErrorUtils.setGlobalHandler((error, isFatal) => {
//   console.error('Global Error:', error, isFatal);
//   // Send to your error tracking service (e.g., Sentry)
// });

// LogBox.ignoreAllLogs();


const App = () => {
  return (

      <Provider store={store}>
        <Router />
      </Provider>

  );
};

export default App;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import {Provider} from 'react-redux';
import store from './store/store';
import {ModalPortal} from 'react-native-modals';
import StackNavigator from './StackNavigator';

function App(): React.JSX.Element {
  return (
    <>
      <Provider store={store}>
        <StackNavigator />
        <ModalPortal />
      </Provider>
    </>
  );
}

export default App;

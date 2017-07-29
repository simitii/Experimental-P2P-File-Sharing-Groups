
import React, { Component } from 'react';
import {
  AppRegistry,
  StatusBar,
  View,
  Dimensions
} from 'react-native';
import App from './js/ui/App.js';

let window = Dimensions.get('window');
let width = window.width;
let height = window.height;

export default class GrupBulut extends Component {
  render(){
    return (
      <View style={{flex:1,backgroundColor:"#1E88E5"}}>
         <StatusBar
           backgroundColor="#1E88E5"
           barStyle="light-content"
          />
          <App style={{top:height*0.03,height:height*0.97}}/>
      </View>
      );
  }
}

AppRegistry.registerComponent('GrupBulut', () => GrupBulut);

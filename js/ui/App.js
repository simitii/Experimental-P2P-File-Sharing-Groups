
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Button,
  View
} from 'react-native';

import {RemoteConnection,LocalConnection} from '../core/Connection.js';
import {DATA_TYPES} from '../core/Constants.js';

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Button
          onPress={this.startConnection}
          title="Learn More"
          color="#841584"
        />
      </View>
    );
  }
  startConnection(){
    console.log('Starting connection');
    let mLocalConnection = new LocalConnection('PEER');
    let mRemoteConnection = new RemoteConnection('PEER2');
    //console.log('LocalConnection ', mLocalConnection);
    //console.log('RemoteConnection ', mRemoteConnection);
    mLocalConnection.remote = mRemoteConnection;
    mRemoteConnection.remote = mLocalConnection;
    let a = 0;
    setInterval(() => {
      //console.log(mLocalConnection.connection.iceConnectionState,mRemoteConnection.connection.iceConnectionState);
      let message = {
                        INFO:{
                          DATA_TYPE:DATA_TYPES.DATA_PIECE,
                          HI:'THERE'
                        },
                        DATA: "YWRhc2Rhc2RhYmQ="
                    };
      mLocalConnection.sendMessage(message);
      //mRemoteConnection.sendMessage('HELLO YOU,TOO'+a++);
    },10000);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

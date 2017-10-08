
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Button,
  View
} from 'react-native';

import {RemoteConnection,LocalConnection} from '../core/BSGG_PROTOCOL/Connection.js';
import ConnectionsManager from '../core/ConnectionsManager.js';
import {User} from '../core/User.js';
import {Device} from '../core/Device.js';
import * as DB from '../core/Database.js';
import {File} from '../core/File.js';
import FileDownloader from '../core/FileDownloader.js';
import {DATA_TYPES,MESSAGE_TYPES,CONNECTION_STATUS} from '../core/Constants.js';

const ImagePicker = require('react-native-image-picker');
const ImagePickerOptions = {
  title: 'Select Avatar',
  customButtons: [
    {name: 'fb', title: 'Choose Photo from Facebook'},
  ],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

let RNFS = require('react-native-fs');

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      fileURL: undefined,
      fileObj: undefined,
      data: undefined
    }
    this.selectFile = this.selectFile.bind(this);
    this.tryToReadFile = this.tryToReadFile.bind(this);
    this.createFile = this.createFile.bind(this);
    this.sendFile = this.sendFile.bind(this);
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Button
          onPress={this.startConnection}
          title="Test Connection"
          color="#841584"
        />
        <Button
          onPress={this.selectFile}
          title="Select File"
          color="#841584"
          />
          <Button
            onPress={this.startDatabase}
            title="Start DB"
            color="#841584"
            />
          <Button
            onPress={this.createFile}
            title="Create File"
            color="#841584"
            />
        <Button
          onPress={this.sendFile}
          title="Test Sending File"
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
  selectFile(){
    console.log(RNFS.DocumentDirectoryPath);
    ImagePicker.showImagePicker(ImagePickerOptions, (response) => {
      console.log('Response = ', {uri:response.uri,origURL:response.origURL});

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = {uri:response.uri,origURL:response.origURL};

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          fileURL: RNFS.DocumentDirectoryPath + source.uri.substr(source.uri.length-48)
        });
      }
    });
  }
  tryToReadFile(){
    console.log('Reading File');
    let data1 = undefined;
    RNFS.readFile(RNFS.DocumentDirectoryPath+'/images/'+'06A7A59E-CFD3-44D3-90E7-C0D586FEC2C6.jpg','base64')
      .then((data) => {
        //console.log('Original: ',data);
        data1 = data;
      })
      .then(() => RNFS.readFile(RNFS.DocumentDirectoryPath+'/DownloadedFiles/'+'06A7A59E-CFD3-44D3-90E7-C0D586FEC2C6.jpg','base64'))
      .then((data) => {
        //console.log('Retrieved: ', data);
        console.log('EQUALITY: ', data===data1);
      })
      .catch((e) => console.log('error: ',e));
  }
  startDatabase(){
    DB.start()
    .then(() => {
      console.log("OK, GET READY");
    });
  }
  createFile(){
    if(this.state.fileURL===undefined || this.state.fileURL===''){
      throw 'fileURL cannot be undefined!';
    }
    File.addNewFile(this.state.fileURL,'TesterSimitii')
      .then((file) => {
        this.setState({fileObj:file});
        console.log('fileObj is set: ', file);
        console.log('hashCode: ', file.hashCode);
        console.log('createdBy: ', file.createdBy);
        console.log('totalSize: ', file.totalSize);
        console.log('peers: ', file.peers);
        console.log('chunks: ', file.chunks);
      })
      .catch((e) => console.log('error: ',e));
  }
  sendFile(){
    console.log('Creating ConnectionsManager instance');
    const connectionsManager = new ConnectionsManager();
    console.log('Creating File for RemoteConnection and FileMeta for LocalConnection!');
    const metaData1 = {
      name: this.state.fileObj.name,
      extention: this.state.fileObj.extention,
      hashCode: this.state.fileObj.hashCode,
      nChunks: this.state.fileObj.nChunks,
      chunkSize: this.state.fileObj.chunkSize,
      chunks: this.state.fileObj.chunks,
      totalSize: this.state.fileObj.totalSize,
      createdBy: 'TesterSimitii'
    };
    let FileMeta = new File(metaData1);
    let HostedFile = this.state.fileObj;
    console.log('Starting connection');
    let mLocalConnection = new LocalConnection('PEER');
    let mRemoteConnection = new RemoteConnection('PEER2');
    mLocalConnection.remote = mRemoteConnection;
    mRemoteConnection.remote = mLocalConnection;

    mLocalConnection.peer = {
      connection: mLocalConnection
    };

    console.log('Creating Local Peer for REMOTE CONNETTION');
    const userForPeer = new User({name:'Samet Demir'});
    let peer = new Device({connectionStatus:CONNECTION_STATUS.CONNECTED,owner:userForPeer,lastestSuppportedProtocol:'A'});
    peer.connection = mRemoteConnection;
    mRemoteConnection.peer = peer;
    let fileDownloader = new FileDownloader(FileMeta);

    setTimeout(()=>{
      console.log('OK LETS GET STARTED');
      fileDownloader.onNewPeer(peer);
    },5000);
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

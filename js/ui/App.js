
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Button,
  View
} from 'react-native';

import {RemoteConnection,LocalConnection} from '../core/Connection.js';
import {User} from '../core/User.js';
import {File} from '../core/File.js';
import {FileDownloader} from '../core/FileDownloader.js';
import {DATA_TYPES,CONNECTION_STATUS} from '../core/Constants.js';

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
            onPress={this.tryToReadFile}
            title="Read File"
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
    if(this.state.fileURL===undefined || this.state.fileURL===''){
      throw 'fileURL cannot be undefined!';
    }
    console.log('Reading File');
    RNFS.readFile('/Users/simitii/Library/Developer/CoreSimulator/Devices/31AB68D2-2C04-4F2A-AF15-03997B4AF812/data/Containers/Data/Application/95464828-9D4E-4C69-A3A9-D19D116E21F7/Documents/tmp/2e79c95fe6b3932ede02c599afdb608596752900b225507f771bb9c5eac1eaf4/0.tmp','base64')
      .then((data) => console.log(data))
      .catch((e) => console.log('error: ',e));
  }
  tryToWriteFile(){
    File._writeData('/Users/simitii/Library/Developer/CoreSimulator/Devices/31AB68D2-2C04-4F2A-AF15-03997B4AF812/data/Containers/Data/Application/95464828-9D4E-4C69-A3A9-D19D116E21F7/Documents/tmp/2e79c95fe6b3932ede02c599afdb608596752900b225507f771bb9c5eac1eaf4/0.tmp',this.state.data,0)
      .then(() => console.log('data is written to file!'))
      .catch((e) => console.log('error: ',e));
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
    console.log('Creating File for RemoteConnection and FileMeta for LocalConnection!');
    const metaData1 = {
      name:file.name,
      extention: file.extention,
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
    mLocalConnection.onDataPieceRequest = (message) => {
      console.log('DATA_PIECE_REQUEST!');
      HostedFile.readData(message.INFO.size,message.INFO.position)
        .then((data) => {
          const res = {
            INFO: {
              DATA_TYPE: DATA_TYPES.DATA_PIECE,
              file: message.INFO.file,
              size: message.INFO.size,
              position: message.INFO.position
            },
            DATA: data
          };
          mLocalConnection.sendMessage(res);
        })
        .catch((e) => console.log(e));
    };
    console.log('Creating Local Peer for REMOTE CONNETTION');
    let peer = new User({name:'Samet Demir',connectionStatus:CONNECTION_STATUS.CONNECTED});
    peer.connection = mRemoteConnection;
    mRemoteConnection.peer = peer;
    let fileDownloader = new FileDownloader(FileMeta);
    mRemoteConnection.onDataPiece = (message) => {
      console.log('DATA_PIECE');
      fileDownloader.onData(mRemoteConnection.peer,message);
    };
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

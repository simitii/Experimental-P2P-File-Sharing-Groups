import {CONNECTION_STATUS,MESSAGE_TYPES,DATA_TYPES} from './Constants.js';

import ObjectMemory from './ObjectMemory.js';
import PermissionChecker from './PermissionChecker.js';
import FileDownloader from './FileDownloader.js';
import {File} from './File.js';



class ConnectionsManager {
  static connect(peer){
    const protocol = peer.protocol;
    protocol.connect();
  }
  static disconnect(peer){
    //Send disconnect signal and handle set operations needed
  }
  static sendMessage(peer,message){
    peer.connection.sendMessage(message);
  }
  static onMessage(peer,message){
    if(peer === undefined){
      throw ('invalid peer: ', peer);
    }
    if(message === undefined || message.INFO === undefined || message.INFO.messageType === undefined){
      throw ('invalid message: ' + message);
    }
    const messageType = message.INFO.messageType;
    const details = message.INFO.details;
    const data = message.DATA;
    switch (messageType) {
      case MESSAGE_TYPES.DATA_PIECE:
        ConnectionsManager.onDataPiece(peer,details,data);
        break;
      case MESSAGE_TYPES.DATA_PIECE_REQUEST:
        ConnectionsManager.onDataPieceRequest(peer,details);
        break;
      case MESSAGE_TYPES.META_DATA_PIECE:
        throw 'Not implemented META_DATA_PIECE (ConnectionsManager.onMessage)'
        break;
      case MESSAGE_TYPES.META_DATA_PIECE_REQUEST:
        throw 'Not implemented META_DATA_PIECE_REQUEST (ConnectionsManager.onMessage)'
        break;
      case MESSAGE_TYPES.SIGNAL:
        throw 'Not implemented SIGNAL (ConnectionsManager.onMessage)'
        break;
      default:
        throw 'UNKNOWN MESSAGE_TYPE'
    }
  }
  static sendSignal(peer,signal){
    const protocol = peer.protocol;
    protocol.sendSignal(signal);
  }
  static onSignal(signal){
    //TODO find peer through signal
  }

  static onDataPiece(peer,details,data){
    const fileDownloader = ObjectMemory.getObject(FileDownloader.name,
                                                                  details.id);
    fileDownloader.onData(peer,details,data);
  }

  static onDataPieceRequest(peer,details){
    const file = ObjectMemory.getObject(File.name,details.id);
    file.readData(details.size,details.position)
      .then((data) => {
        const message = {
          INFO: {
            messageType: MESSAGE_TYPES.DATA_PIECE,
            dataType: DATA_TYPES.BASE64,
            details: details
          },
          DATA: data
        };
        ConnectionsManager.sendMessage(peer,message);
      })
      .catch((e) => console.log(e));
  }
}

export default ConnectionsManager;

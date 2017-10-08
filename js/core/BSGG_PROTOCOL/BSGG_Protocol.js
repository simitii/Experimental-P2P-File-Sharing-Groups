import {EXCEPTION,CONNECTION_STATUS} from '../Constants.js';
import {RemoteConnection,LocalConnection} from './Connection.js';
import Protocol from '../Protocol.js';

/**
  *      BSGG_Protocol
  *   ProtocolName: BSGG
  *   ProtocolCode: A
  *   Connection: WebRTC
  *   Signaling: OneSignal
  *   Devices Supported: Mobile(Android, iOS)
  */
class BSGG_Protocol extends Protocol {
  constructor(peer){
    if(peer === undefined){
      EXCEPTION.NECESSARY_PARAMS('BSGG_Protocol.constructor');
    }
    super(peer);
  }
  connect(){
    if(this.connection!==undefined && this.connectionStatus===CONNECTION_STATUS.CONNECTED){
      throw 'already connected to the peer'
    }
    //TODO
  }
  disconnect(){
    if(this.connection===undefined){
      throw 'already disconnected to the peer'
    }
    //TODO
  }
  sendMessage(){
    //TODO
  }
  sendSignal(){
    //TODO
  }
  getDetails(){
    return {
      protocolName: BSGG_Protocol.name,
      protocolCode: BSGG_Protocol.code
    };
  }
  toString(){
    return `${BSGG_Protocol.name} Protocol(code: '${BSGG_Protocol.code}')`;
  }
}
BSGG_Protocol.code = 'A';
BSGG_Protocol.name = 'BSGG';

export default BSGG_Protocol;

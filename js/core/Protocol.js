import {EXCEPTION} from './Constants.js';
import {RemoteConnection,LocalConnection} from './BSGG_PROTOCOL/Connection.js';

/**
  * In this context, Protocols are
  *   Wrappers arround Connection and Signaling Channels
  *
  *   For Example:
  *   WebRTC for Connection and OneSignal for Signaling
  *   can form a protocol (see BSGG_Protocol below)
  */

/**
  *   Protocol Abstract_Class is the class
  *   that everyone of the Protocols must inherit
  */
class Protocol {
  constructor(name,code){
    if(new.target === Protocol){
      EXCEPTION.INTERFACE_ABSTRACT_CLASS_ERROR.throw('Protocol');
    }
    if(name===undefined || code===undefined){
      EXCEPTION.NECESSARY_PARAMS('Protocol.constructor');
    }
    this.name = name;
    this.code = code;
  }
  static initWithProtocolCode(protocolCode){
    if(protocolCode===undefined){
      EXCEPTION.NECESSARY_PARAMS('Protocol.initWithProtocolCode');
    }
    switch (protocolCode) {
      case BSGG_Protocol.code:
        return new BSGG_Protocol();

      //TODO ADD NEW PROTOCOLS HERE

      default:
        EXCEPTION.UNKNOWN_PROTOCOL.throw(protocolCode);
    }
  }
  connect(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Protocol.connect');
  }
  disconnect(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Protocol.disconnect');
  }
  sendSignal(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Protocol.sendSignal');
  }
  getDetails(){
    return {
      protocolName: this.name,
      protocolCode: this.code
    };
  }
  toString(){
    return `${this.name} Protocol(code: '${this.code}')`;
  }
}

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
    //super( name ,code);
      super('BSGG','A');
      this.peer = peer;
  }
  connect(){
    
  }
  disconnect(){

  }
  sendSignal(){

  }
}

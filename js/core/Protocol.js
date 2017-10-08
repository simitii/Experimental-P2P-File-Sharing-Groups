import {EXCEPTION,CONNECTION_STATUS} from './Constants.js';

/**
  * In this context, Protocols are
  *   Wrappers arround Connection and Signaling Channels
  *
  *   For Example:
  *   WebRTC for Connection and OneSignal for Signaling
  *   can form a protocol (see BSGG_Protocol)
  */

/**
  *   Protocol Abstract_Class is the class
  *   that everyone of the Protocols must extend
  */
class Protocol {
  constructor(peer){
    if(new.target === Protocol){
      EXCEPTION.INTERFACE_ABSTRACT_CLASS_ERROR.throw('Protocol');
    }
    this.peer = peer;
    this.connectionStatus = this.peer.connectionStatus;
    this.connection = undefined;
  }
  connect(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Protocol.connect');
  }
  disconnect(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Protocol.disconnect');
  }
  sendMessage(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Protocol.sendMessage');
  }
  sendSignal(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Protocol.sendSignal');
  }
  getDetails(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Protocol.getDetails');
  }
  toString(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Protocol.toString');
  }
}

export default Protocol;


const base64_arraybuffer = require('base64-arraybuffer');

class MessageDecoder{
  constructor(peer){
    this.peer = peer;
  }
  static stringToArrayBuffer(string){
    let charList = string.split(''),
        uintArray = [];
    for (let i = 0; i < charList.length; i++) {
        uintArray.push(charList[i].charCodeAt(0));
    }
    return new Uint8Array(uintArray);
  }
  static arrayBufferToString(uintArray){
    return String.fromCharCode.apply(null, uintArray)
  }
  static jsonToArrayBuffer(json) {
    try{
      const str = JSON.stringify(json);
      return MessageDecoder.stringToArrayBuffer(str);
    }catch(e){
      throw ('JSON -> Uint8Array(ArrayBuffer) error: ' + e);
    }
 }
 static arrayBufferToJson(uintArray) {
   try{
     const str = MessageDecoder.arrayBufferToString(uintArray);
     return JSON.parse(str);
   }catch(e){
     throw ('Uint8Array(ArrayBuffer) -> JSON error: ' + e);
   }
 }
 static base64ToArrayBuffer(base64){
    return base64_arraybuffer.decode(base64);
 }
 static arrayBufferToBase64(uintArray){
   return base64_arraybuffer.encode(uintArray);
 }
  /*
   *    Takes JSON as parameter and returns ArrayBuffer
   *    example-json:{
   *      INFO: JSON {DATA_TYPE & OTHER RELATED INFO}
   *      DATA: String || JSON || Base64(if sending DATA_PIECE)
   *    }
   */
   encode(json){
    //console.log('json', json);
    if(json===undefined || json===null){
      throw 'json parameter is neccessary!';
    }
    if(json.INFO===undefined || json.INFO.DATA_TYPE===undefined){
      throw 'parameter is not formed according to docs. Check MessageDecoder Class!';
    }
    // JSON -> Uint8Array(ArrayBuffer)
    let info = MessageDecoder.jsonToArrayBuffer(json.INFO);
    if(info.buffer.byteLength>255){
      throw ('INFO byteLength cannot be bigger than 255: ' + info.buffer.byteLength);
    }

    let info_length = new Uint8Array(2);
    info_length.set([info.buffer.byteLength],0);
    let data = undefined;
    switch (json.INFO.DATA_TYPE) {
      case DATA_TYPES.BASE64:
        if(json.DATA===undefined){
          throw 'parameter is not formed according to docs. Check MessageDecoder Class!';
        }
        // BASE64 -> ArrayBuffer(Uint8Array)
        data = MessageDecoder.base64ToArrayBuffer(json.DATA);
        break;
      case DATA_TYPES.JSON:
        if(json.DATA===undefined){
          throw 'parameter is not formed according to docs. Check MessageDecoder Class!';
        }
        // JSON -> ArrayBuffer(Uint8Array)
        data = MessageDecoder.jsonToArrayBuffer(json.DATA);
        break;
      case DATA_TYPES.STRING:
        if(json.DATA===undefined){
          throw 'parameter is not formed according to docs. Check MessageDecoder Class!';
        }
        // STRING -> ArrayBuffer(Uint8Array)
        data = MessageDecoder.stringToArrayBuffer(json.DATA);
        break;
      case undefined:
        break;
      default:
          throw 'unknown DATA_TYPE for MessageDecoder!';
    }
    if(data===undefined){
      let tmp = new Uint8Array(2 + info.buffer.byteLength);
      tmp.set(info_length, 0);
      tmp.set(info, 2);
      return tmp.buffer;
    }else{
      let tmp  = new Uint8Array(2 + info.buffer.byteLength + data.byteLength);
      tmp.set(info_length, 0);
      tmp.set(info, 2);
      tmp.set(new Uint8Array(data), 2+info.buffer.byteLength);
      return tmp.buffer;
    }
  }
  /*
   *  Takes ArrayBuffer as parameter and returns JSON
   *  example-arraybuffer: INFO_LENGTH: first 2bytes (uint)
   *                        + INFO: next INFO_LENGTH bytes of the arraybuffer
   *                        + DATA: rest of the arraybuffer(if sending DATA_PIECE) (uintarray)
   */
   decode(arraybuffer){
    if(arraybuffer===undefined || arraybuffer===null){
      throw 'arraybuffer parameter is neccessary!';
    }
    if(arraybuffer.byteLength<2){
      throw 'arraybuffer cannot be shorter than 2 bytes!';
    }
    // first byte of the arraybuffer -> integer
    let info_length = new Uint8Array(arraybuffer.slice(0,2))[0];

    //info part of the arraybuffer -> JSON
    const info_arraybuffer = arraybuffer.slice(2,2+info_length);
    const info = MessageDecoder.arrayBufferToJson(new Uint8Array(info_arraybuffer));


    let data = undefined;
    switch (info.DATA_TYPE) {
      case DATA_TYPES.BASE64:
        // rest of the arraybuffer -> BASE64
        let data_arraybuffer = arraybuffer.slice(2+info_length);
        data = MessageDecoder.arrayBufferToBase64(data_arraybuffer);
        break;
      case DATA_TYPES.JSON:
        // rest of the arraybuffer -> JSON
        let data_arraybuffer = arraybuffer.slice(2+info_length);
        data = MessageDecoder.arrayBufferToJson(data_arraybuffer);
      case DATA_TYPES.STRING:
        // rest of the arraybuffer -> STRING
        let data_arraybuffer = arraybuffer.slice(2+info_length);
        data = MessageDecoder.arrayBufferToString(data_arraybuffer);
      case undefined:
        break;
      default:
        throw 'unknown DATA_TYPE for MessageDecoder!';
    }
    return {
      INFO: info,
      DATA: data
    };
  }
}

export {MessageDecoder};


class MessageDecoder{
  constructor(peer){
    this.peer = peer;
  }
  static _stringToUint(string) {
    let charList = string.split(''),
        uintArray = [];
    for (let i = 0; i < charList.length; i++) {
        uintArray.push(charList[i].charCodeAt(0));
    }
    return new Uint8Array(uintArray);
 }
 static _uintToString(uintArray) {
    return String.fromCharCode.apply(null, uintArray);
 }
  /*
   *    Takes JSON as parameter and returns ArrayBuffer
   *    example-json:{
   *      INFO: JSON {DATA_TYPE & OTHER RELATED INFO}
   *      DATA: Base64(if sending DATA_PIECE)
   *    }
   */
   encode(json){
    //TODO IMPLEMENT ENCRYPTION!!!
    //console.log('json', json);
    if(json===undefined || json===null){
      throw 'json parameter is neccessary!';
    }
    if(json.INFO===undefined || json.INFO.DATA_TYPE===undefined){
      throw 'parameter is not formed according to docs. Check MessageDecoder Class!';
    }
    let info = undefined;
    try{
      // JSON -> Uint8Array
      info = MessageDecoder._stringToUint(JSON.stringify(json.INFO));
    }catch(e){
      throw ('JSON -> Uint8Array error: ' + e);
    }
    if(info.buffer.byteLength>255){
      throw ('INFO byteLength cannot be bigger than 255: ' + info.buffer.byteLength);
    }

    let info_length = new Uint8Array(2);
    info_length.set([info.buffer.byteLength],0);

    if(json.INFO.DATA_TYPE === DATA_TYPES.DATA_PIECE){
      if(json.DATA===undefined){
        throw 'parameter is not formed according to docs. Check MessageDecoder Class!';
      }
      // BASE64 -> ArrayBuffer(Uint8Array)
      let data = base64_arraybuffer.decode(json.DATA);
      let tmp  = new Uint8Array(2 + info.buffer.byteLength + data.byteLength);
      tmp.set(info_length, 0);
      tmp.set(info, 2);
      tmp.set(new Uint8Array(data), 2+info.buffer.byteLength);
      return tmp.buffer;
    }else{
      let tmp = new Uint8Array(2 + info.buffer.byteLength);
      tmp.set(info_length, 0);
      tmp.set(info, 2);
      return tmp.buffer;
    }
  }
  /*
   *  Takes ArrayBuffer as parameter and returns JSON
   *  example-arraybuffer: INFO_LENGTH: first 2bytes (uint)
   *                        + INFO: next INFO_LENGTH bytes of the arraybuffer
   *                        + DATA: rest of the arraybuffer(if sending DATA_PIECE) (uintarray)
   */
   decode(arraybuffer){
    // TODO IMPLEMENT DECRYPTION!!!
    if(arraybuffer===undefined || arraybuffer===null){
      throw 'arraybuffer parameter is neccessary!';
    }
    if(arraybuffer.byteLength<2){
      throw 'arraybuffer cannot be shorter than 2 bytes!';
    }
    // first byte of the arraybuffer -> integer
    let info_length = new Uint8Array(arraybuffer.slice(0,2))[0];

    //info part of the arraybuffer -> JSON
    let info = undefined;
    try{
      let info_arraybuffer = arraybuffer.slice(2,2+info_length);
      let objString = MessageDecoder._uintToString(new Uint8Array(info_arraybuffer));
      //console.log('objString: ', objString);
      info = JSON.parse(objString);
    }catch(e){
      throw ('info part of the arraybuffer -> JSON error: ' + e);
    }

    let data = undefined;
    if(info.DATA_TYPE === DATA_TYPES.DATA_PIECE){
      // rest of the arraybuffer -> BASE64
      let data_arraybuffer = arraybuffer.slice(2+info_length);
      data = base64_arraybuffer.encode(data_arraybuffer);
    }

    return {
      INFO: info,
      DATA: data
    };
  }
}

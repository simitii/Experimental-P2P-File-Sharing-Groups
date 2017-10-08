import {EXCEPTION} from './Constants.js';
import * as DB from './Database.js';
import ObjectMemory from './ObjectMemory.js';
import PermissionChecker from './PermissionChecker.js';

import {File} from './File.js';
import {User} from './User.js';


const MetaDataSchema = {
  name: 'MetaData',
  primaryKey: 'id',
  properties: {
    id: {type:'string'},
    relatedObject: {type:'string'},
    updateMethod: {type:'string'},
    data: {type:'string',default:''},
    dataLength: {type: 'int'},
    dataPieces: {type: 'list', objectType: DB.StringSchema.name},
    createdBy: {type: 'list', objectType: 'string'},
    createdAt: {type: 'date'}
  }
};
DB.registerSchema(MetaDataSchema);

class MetaData {
  constructor(args) {
    this.relatedObject = args.relatedObject;
    this.updateMethod = args.updateMethod;
    if(args.data !== undefined){
      this.data = JSON.stringify(args.data);
      this.dataLength = this.data.length;
    }else{
      this.dataLength = args.dataLength;
      this.dataPieces = Array.apply(null, Array(this.dataLength)).map(() => "");
    }
    this.createdBy = args.createdBy;
    this.createdAt = args.createdAt || Date.now();
    if(args.id === undefined || MetaData.get(args.id) === undefined){
      DB.createObject(MetaDataSchema.name, obj,(id)=>{
        this.id = id;
      });
    }

    //Add to ObjectMemory
    ObjectMemory.addObject(this.constructor.name,this);
  }
  getSignallingObj(){
    //MetaData Signalling
    return {
      relatedObject: this.relatedObject,
      updateMethod: this.updateMethod;
      id: this.id,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      dataLength: this.dataLength
    };
  }
  static createMetaData(relatedObject,updateMethod,data,createdBy){
    if(relatedObject===undefined || updateMethod === undefined
      || data===undefined || createdBy===undefined){
      throw "MetaData.createMetaData didn't get neccessary params!";
    }
    const args = {
      relatedObject: relatedObject,
      updateMethod: updateMethod,
      data: data,
      createdBy: createdBy,
      createdAt: Date.now()
    };
    const metadata = new MetaData(args);
    return metadata.getSignallingObj();
  }
  static onMetaDataSignal(signal){
    MetaData.checkPermission(signal);
    const obj = new MetaData(signal);
    if(obj.data !== undefined || obj.dataLength === 0){
      const metadata = MetaData.buildMetaData(obj);
      MetaData.processMetaData(metadata);
    }else{
      //TODO Create MetaDataDownloader
    }
  }
  static checkPermission(metadata,relatedObjInfo = undefined){
    if(relatedObjInfo === undefined){
      relatedObjInfo = MetaData.getRelatedObjectInfo(metadata.relatedObject);
    }
    let permission = false;
    if(metadata.updateMethod === 'constructor'){
      permission = PermissionChecker.hasPermissionToCreate(relatedObjInfo.className,
      signal.createdBy);
    }else{
      const obj = ObjectMemory.getObject(relatedObjInfo.className,relatedObjInfo.objectID);
      permission = PermissionChecker.hasPermissionToUpdate(obj,signal.createdBy);
    }
    if(permission !== true){
      throw 'Permission Rejected!';
    }
  }
  static get(id){
    return DB.retrieveObjectWithID(MetaDataSchema.name,id);
  }
  static getPiece(id,size,position=0){
    const metadata = MetaData.get(id);
    if(metadata.data === undefined){
      return undefined;
    }
    return metadata.data.substr(position,position+size);
  }
  static setPiece(id,pieceIndex,data){
    const obj = MetaData.get(id);
    if(pieceIndex>=obj.dataLength){
      throw 'Wrong pieceIndex for MetaData.setPiece';
    }
    obj.dataPieces[pieceIndex] = data;
    //Save Change to DB
    const update = new Map();
    update.set('dataPieces',obj.dataPieces);
    DB.updateObjectWithID(MetaDataSchema.name,id,update);
  }
  static buildMetaDataWithID(id){
    const obj = MetaData.get(id);
    return MetaData.buildMetaData(obj);
  }
  static buildMetaData(obj){
    for(let i=0;i<obj.dataPieces.length;i++){
      if(obj.dataPieces[i] === ""){
        throw ('Data Piece #' + i + ' is not set yet!');
      }
      obj.data += obj.dataPieces[i];
    }
    let metadata = {
      relatedObject: obj.relatedObject,
      updateMethod: obj.updateMethod,
      createdBy: obj.createdBy,
      createdAt: obj.createdAt
    };
    try{
      metadata.data = JSON.parse(obj.data);
    }catch(e){
        console.log('MetaData parsing(JSON) Exception ', e);
    }
    return metadata;
  }
  static createRelatedObjectCode(relatedObject=undefined){
    if(relatedObject===undefined){
      throw 'MetaData.createRelatedObjectCode: neccessary param Exception!';
    }
    return relatedObject.constructor.name + "-" + relatedObject.id;
  }
  static getRelatedObjectInfo(relatedObjectCode){
    if(relatedObjectCode===undefined){
      throw 'MetaData.getRelatedObject: neccessary param Exception!';
    }
    const arr = relatedObjectCode.split("-");
    if(arr.length!==2){
      throw 'MetaData.getRelatedObject: improper relatedObjectCode!';
    }
    return {
      className : arr[0],
      objectID  : arr[1]
    };
  }
  static processMetaData(metadata=undefined){
    if(metadata===undefined){
      throw 'MetaData.processMetaData: neccessary param Exception!';
    }
    MetaData.checkPermission(metadata);
    const relatedObjInfo = MetaData.getRelatedObjectInfo(metadata.relatedObject);
    const obj = ObjectMemory.getObject(relatedObjInfo.className,relatedObjInfo.objectID);
    if(metadata.updateMethod !== 'constructor'){
      if(obj === undefined){
        throw 'MetaData.processMetaData: undefined object cannot be changed!';
      }
      obj[metadata.updateMethod](data);
    }else{
      switch (relatedObjInfo.className) {
        case User.name:
            new User(metadata.data);
          break;
        case File.name:
            new File(metadata.data);
          break;
        default:
          throw ('MetaData.processMetaData: ' + relatedObjInfo.className +
                                            ' is not a valid class to proceed!');
      }
    }
  }
  static deleteMetaData(id){
    DB.deleteObjectWithID(MetaDataSchema.name,id);
  }

}

export default MetaData;

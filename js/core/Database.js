import {EVENT,EXCEPTION,DOWNLOAD_STATUS} from './Constants.js';
import UniqueID from './UniqueID.js';

const Realm = require('realm');
const CryptoJS = require("crypto-js");

let realm = undefined;
const schemas = new Map();
let started = false;


const registerSchema = (schema) => {
  if(started){
    throw 'You cant register new schema after database is started!';
  }
  if(schemas.has(schema.name)){
    throw (`${schema.name} Schema is already registered!`);
  }
  schemas.set(schema.name, schema);
}

// For string list(array)
const StringSchema = {
    name: 'StringSchema',
    properties: { value: 'string' }
};
registerSchema(StringSchema);

// For int list(array)
const IntegerSchema = {
  name: 'IntegerSchema',
  properties: {value: 'int'}
};
registerSchema(IntegerSchema);

const start = () => {
  if(started){
    throw 'Database is already started!';
  }
  started = true;
  const schemaArray = Array.from(schemas).map(([key,value]) => {
    return value;
  });
  return Realm.open({schema:schemaArray})
    .then((_realm) => {
      realm = _realm;
      console.log("DB is Started!");
    })
    .catch((e) => console.log('DB Starting Exception', e));
};


const createObject = (schemaName,object,idCallback = undefined) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  if(object.id === undefined){
    object.id = UniqueID.createForObj(object);
    if(idCallback !== undefined)
      idCallback(object.id);
  }
  try{
    realm.write(() => {
      realm.create(schemaName,object);
    });
  }catch(e){
    console.log('DB Object Creation Exception',e);
  }
};

const retrieveAllObjects = (schemaName) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  return realm.objects(schemaName);
};

const retrieveObjectWithID = (schemaName,objectID) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  return realm.objects(schemaName).filtered(`id = "${objectID}"`)[0];
};

const retrieveObjectsWithQuery = (schemaName,query) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  return realm.objects(schemaName).filtered(query);
};

//update should be Map object
const updateObjectWithID = (schemaName,objectID,update) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  const object = retrieveObjectWithID(schemaName,objectID);
  try{
    realm.write(() => {
      update.foreach(([key,value]) => {
        object[key] = value;
      });
    });
  }catch(e){
    console.log('DB Object Update Exception',e);
  }
};

const updateObjectsWithQuery = (schemaName,query,update) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  const objects = retrieveObjectsWithQuery(schemaName,query)[0];
  try{
    realm.write(() => {
      objects.map((object) => {
        update.foreach(([key,value]) => {
          object[key] = value;
        });
      });
    });
  }catch(e){
    console.log('DB Object Update Exception',e);
  }
};

const updateAllObjects = (schemaName,update) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  const objects = retrieveAllObjects(schemaName);
  try{
    realm.write(() => {
      objects.map((object) => {
        update.foreach(([key,value]) => {
          object[key] = value;
        });
      });
    });
  }catch(e){
    console.log('DB Object Update Exception',e);
  }
};

const pushToListInObjectWithID = (schemaName,objectID,update) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  const object = retrieveObjectWithID(schemaName,objectID);
  try{
    realm.write(() => {
      update.foreach(([key,value]) => {
        object[key].push(value);
      });
    });
  }catch(e){
    console.log('DB Object Array Push Exception',e);
  }
};

const deleteFromListInObjectWithID = (schemaName,objectID,update) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  const object = retrieveObjectWithID(schemaName,objectID);
  try{
    realm.write(() => {
      update.foreach(([key,value]) => {
        // value refers to the object which will be deleted
        const index = object[key].indexOf(value);
        if(index===-1){
          throw 'Value is not in the List';
        }
        object[key].splice(index,1);
      });
    });
  }catch(e){
    console.log('DB Object Array Delete Exception',e);
  }
};

const deleteObjectWithID = (schemaName,objectID) => {
  if(!started){
    throw ("DB is not started yet!");
  }
  const object = retrieveObjectWithID(schemaName,objectID);
  try{
    realm.write(() => {
      realm.delete(object);
    });
  }catch(e){
    console.log('DB Object Delete Exception',e);
  }
};

export {StringSchema,IntegerSchema,registerSchema,start,createObject,retrieveAllObjects,
  retrieveObjectWithID,retrieveObjectsWithQuery,updateObjectWithID,
  updateObjectsWithQuery,updateAllObjects,pushToListInObjectWithID,
  deleteFromListInObjectWithID,deleteObjectWithID};

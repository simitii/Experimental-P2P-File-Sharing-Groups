
const classMaps = new Map();

class ObjectMemory{
  static registerClass(className=undefined){
    if(className===undefined){
      throw 'ObjectMemory.registerClass: className cannot be undefined!';
    }
    if(classMaps.has(className)){
      throw ('ObjectMemory.registerClass: the class already exist!');
    }
    console.log("ObjectMemory.registerClass: ",className);
    classMaps.set(className,new Map());
  }
  static addObject(className=undefined,object=undefined,objectID=undefined){
    if(className===undefined && object===undefined){
      throw 'ObjectMemory.addObject: className and object cannot be undefined!';
    }
    if(!classMaps.has(className)){
      throw 'ObjectMemory.addObject: the class was not found';
    }
    const objectMap = classMaps.get(className);
    objectID = objectID || object.id;
    /*
    NOTE CLOSED FOR TESTING PURPOSE!
    if(objectMap.has(objectID)){
      throw 'ObjectMemory.addObject: the object already exist!';
    }
    */
    if(!objectMap.has(objectID)){
      console.log("ObjectMemory.addObject: ",className,objectID);
      objectMap.set(objectID, object);
    }
  }
  static removeObject(className=undefined,objectID=undefined){
    console.log("ObjectMemory.removeObject: ",className,objectID);
    if(className===undefined && objectID===undefined){
      throw 'ObjectMemory.removeObject: className and objectID cannot be undefined!';
    }
    if(!classMaps.has(className)){
      throw 'ObjectMemory.removeObject: the class was not found';
    }
    const objectMap = classMaps.get(classMaps);
    if(!objectMap.has(objectID)){
      throw 'ObjectMemory.removeObject: the object was not found';
    }
    objectMap.delete(objectID);
  }
  static getObject(className=undefined,objectID=undefined){
    console.log("ObjectMemory.getObject: ",className,objectID);
    if(className===undefined && objectID===undefined){
      throw 'ObjectMemory.getObject: className and objectID cannot be undefined!';
    }
    if(!classMaps.has(className)){
      throw 'ObjectMemory.getObject: the class was not found';
    }
    const objectMap = classMaps.get(className);
    console.log("Printing Current ObjectMemory Stack:");
    objectMap.forEach((value,key,map)=>{
      console.log(`m[${key}] = ${value}`);
    });
    if(!objectMap.has(objectID)){
      throw 'ObjectMemory.getObject: the object was not found';
    }
    return objectMap.get(objectID);
  }
}

export default ObjectMemory;

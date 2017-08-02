import {File,Folder} from '../js/core/File.js';
import {EXCEPTION,DOWNLOAD_STATUS} from '../js/core/Constants.js';


const metaData = {
  hashCode: 'd8a928b2043db77e340b523547bf16cb4aa483f0645fe0a290ed1f20aab76257',
  name: 'test',
  description: 'test file description',
  createdBy: 'unit test',
  totalSize: 10.12,
};

describe("File Class Tests",() => {
  test("constructor",() => {
    const file = new File(metaData);
    const testObj = Object.assign({},File.defaults(),metaData);
    expect(file).toEqual(testObj);

    //CONST PROPERTIES
    expect(() => {
      file.hashCode = "changing hashCode";
    }).toThrow(EXCEPTION.CANNOT_SET_AFTER_INIT.test('hashCode','File'));
    expect(() => {
      file.createdBy = "TESTER";
    }).toThrow(EXCEPTION.CANNOT_SET_AFTER_INIT.test('createdBy','File'));
    expect(() => {
      file.totalSize = 123;
    }).toThrow(EXCEPTION.CANNOT_SET_AFTER_INIT.test('totalSize','File'));


    //ENUM PROPERTIES
    expect(() => {
      file.downloadStatus = 'XYZ';
    }).toThrow(EXCEPTION.INVALID_VALUE.test('XYZ',DOWNLOAD_STATUS.toString()));
    expect(() => {
      file.downloadStatus = DOWNLOAD_STATUS.ORDERED;
    }).not.toThrow();
    expect(file.downloadStatus).toBe(DOWNLOAD_STATUS.ORDERED);
  });

  test("addNewFile method",(done) => {
    let tmp = undefined;
    expect.assertions(2);
    expect(() => {
      File.addNewFile(undefined);
    }).toThrow(EXCEPTION.INVALID_VALUE.test('undefined','FilePath'));

    File.addNewFile('file://deneme.txt','Tester')
      .then((_file)=>{
        tmp = _file;
        expect(tmp).not.toBe(undefined);
        console.log(tmp);
        console.log('totalSize: ',tmp.totalSize);
        console.log('chunks: ',tmp.chunks);
        console.log('hashCode: ',tmp.hashCode);
        done();
      })
      .catch((e) => {
        console.log('error: ', e);
      });
  });

  test("_createChunks method",(done) => {
    expect.assertions(2);
    File._createChunks('file://deneme.txt',1048576) //1MB
      .then((chunks) => {
        expect(Array.isArray(chunks)).toBe(true);
        expect(chunks[0].length).toBe(64);
        console.log('chunks: ', chunks);
        done();
      })
      .catch((e) => {
        console.log('error: ', e);
      });
  });
});

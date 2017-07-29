import {File,Folder} from '../js/core/File.js';
import {EXCEPTION,DOWNLOAD_STATUS} from '../js/core/Constants.js';

let file = undefined;
const metaData = {
  hashCode: 'd8a928b2043db77e340b523547bf16cb4aa483f0645fe0a290ed1f20aab76257',
  name: 'test',
  description: 'test file description',
  createdBy: 'unit test',
  totalSize: 10.12,
};

describe("File Class Tests",() => {
  test("constructor",() => {
    file = new File(metaData);
    expect(file.hashcode).toBe(metaData.hashcode);
    expect(file.name).toBe(metaData.name);
    expect(file.description).toBe(metaData.description);
    expect(file.createdBy).toBe(metaData.createdBy);
    expect(file.totalSize).toBe(metaData.totalSize);
    expect(file.downloadedSize).toBe(0.0);
    expect(file.downloadStatus).toBe(DOWNLOAD_STATUS.NOT_ORDERED);
    expect(Array.isArray(file.peers)).toBe(true);
    expect(Array.isArray(file.chunks)).toBe(true);
    expect(file.extention).toBe('');

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
  })
});

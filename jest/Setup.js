//Mock Native Modules

jest.mock('react-native-fs', () => {
  return {
    exists: jest.fn(()=> Promise.resolve(true)),  //File exists
    readDir: jest.fn(() => Promise.resolve({
      //File metaData
      ctime: new Date(),     // The creation date of the file (iOS only)
      mtime: new Date(),     // The last modified date of the file
      name: 'TestFile',      // The name of the item
      path: 'file://TestFile.extention',     // The absolute path to the item
      size: '1048576',  //1MB     // Size in bytes
      isFile: () => true,        // Is the file just a file?
      isDirectory: () => false   // Is the file a directory?
    })),
    hash: jest.fn(() => Promise.resolve(
      //SHA256 hashCode
      'd8a928b2043db77e340b523547bf16cb4aa483f0645fe0a290ed1f20aab76257'
    )),
    read: jest.fn(() => Promise.resolve(
      //BASE64 string
      'YXNkYXNkbGthc2xka2xhc2toZGxhc2Zoa2FzZmxzYWRramFsc2FsZGprbGFzZm4geCxtY25tLHNjbWRuLHZzZGY='
    ))
  }
});

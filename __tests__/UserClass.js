import {User,Me} from '../js/core/User.js';
import {EXCEPTION} from '../js/core/Constants.js';

describe("User Class Tests",() => {
  test("constructor",()=> {
    const args = {
      _name: 'John Dalton'
    };
    let user = new User(args);
    expect(user.name).toBe(args._name);
    expect(Array.isArray(user.rootDirectoryFiles)).toBe(true);
    expect(user.profilePicture).toBeUndefined();
    expect(user.profileDescription).toBe('');
    expect(user.connection).toBeUndefined();
    expect(user.connectionStatus).toBeUndefined();
    expect(Array.isArray(user.connectionStatusListeners)).toBe(true);
    expect(user.isMe).toBe(false);
  });

  test("setters and getters",() => {
    const args = {
      _name: 'John Dalton'
    };
    let user = new User(args);

    //Check name property
    expect(() => {
      user.name = undefined;
    }).toThrow();
    expect(user.name).toBe(args._name);
    user.name = "Sam Smith";
    expect(user.name).toBe("Sam Smith");

    //Check profilePicture property
    expect(() => {
      user.profilePicture = undefined;
    }).toThrow();
    user.profilePicture = 'asd';
    expect(user.profilePicture).toBe('asd');

    //Check profileDescription property
    expect(() => {
      user.profileDescription = undefined;
    }).toThrow();
    user.profileDescription = 'fgh';
    expect(user.profileDescription).toBe('fgh');
  });

  test("Differences Between Me & User Classes",() => {
    const args = {
      _name: 'John Dalton'
    };
    let user = new User(args);
    expect(() => {
      user.changeUsername();
    }).toThrow(EXCEPTION.WRONG_FUNCTION_CALL.test('changeUsername','User'));
    expect(() => {
      user.changeProfilePicture();
    }).toThrow(EXCEPTION.WRONG_FUNCTION_CALL.test('changeProfilePicture','User'));
    expect(() => {
      user.changeProfileDescription();
    }).toThrow(EXCEPTION.WRONG_FUNCTION_CALL.test('changeProfileDescription','User'));

    user = new Me(args);

    expect(() => {
      user.changeUsername('Sam Smith');
    }).not.toThrow();
    expect(() => {
      user.changeProfilePicture('url');
    }).not.toThrow();
    expect(() => {
      user.changeProfileDescription('description');
    }).not.toThrow();

    expect(() => {
      user.onConnectionStatusChange();
    }).toThrow(EXCEPTION.WRONG_FUNCTION_CALL.test('onConnectionStatusChange','Me'));
    expect(() => {
      user.addConnectionStatusListener();
    }).toThrow(EXCEPTION.WRONG_FUNCTION_CALL.test('addConnectionStatusListener','Me'));
    expect(() => {
      user.removeConnectionStatusLister();
    }).toThrow(EXCEPTION.WRONG_FUNCTION_CALL.test('removeConnectionStatusLister','Me'));
  });

  test("ConnectionStatusChange Event Functionalities",() => {
    const args = {
      _name: 'John Dalton'
    };
    let user = new User(args);

    //Testing with one listener
    const mockFn = jest.fn();
    user.addConnectionStatusListener(mockFn);
    user.addConnectionStatusListener(mockFn);
    user.onConnectionStatusChange('CONNECTED');
    expect(mockFn).toBeCalledWith(user,'CONNECTED');
    expect(mockFn.mock.calls.length).toBe(1);

    //Testing with more than one listener
    const mockFn2 = jest.fn();
    expect(mockFn2).not.toBe(mockFn);
    user.addConnectionStatusListener(mockFn2);
    user.onConnectionStatusChange('DISCONNECTED');
    expect(mockFn2.mock.calls.length).toBe(1);
    expect(mockFn.mock.calls.length).toBe(2);

    //Testing remove function
    user.removeConnectionStatusLister(mockFn);
    user.onConnectionStatusChange('CONNECTED');
    expect(mockFn.mock.calls.length).toBe(2);
    expect(mockFn2.mock.calls.length).toBe(2);

    //Testing to remove same thing twice
    user.removeConnectionStatusLister(mockFn);
    user.onConnectionStatusChange('DISCONNECTED');
    expect(mockFn.mock.calls.length).toBe(2);
    expect(mockFn2.mock.calls.length).toBe(3);

    //Testing empty listener stack
    user.removeConnectionStatusLister(mockFn2);
    user.onConnectionStatusChange('CONNECTED');
    expect(mockFn.mock.calls.length).toBe(2);
    expect(mockFn2.mock.calls.length).toBe(3);

  });
});

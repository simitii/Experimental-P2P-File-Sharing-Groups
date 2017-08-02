import {User,Me} from '../js/core/User.js';
import {EXCEPTION} from '../js/core/Constants.js';

describe("User Class Tests",() => {
  test("constructor",()=> {
    const args = {
      name: 'John Dalton'
    };
    const user = new User(args);
    const defaults = User.defaults();
    const testObj = Object.assign({},defaults,args);
    expect(user).toEqual(testObj);
  });

  test("Differences Between Me & User Classes",() => {
    const args = {
      name: 'John Dalton'
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
      name: 'John Dalton'
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

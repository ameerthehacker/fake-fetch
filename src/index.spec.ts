import fakeFetch, { FakeConfig } from './index';

describe('fakeFetch()', () => {
  const delayThresold = 100;

  it('should fake simple get fetch request', async () => {
    const usersResponse = JSON.stringify({
      users: ['ameer', 'sudhanshu']
    });
    const expectedResponse = new Response(usersResponse);
    const fakeConfig: FakeConfig = {
      request: '/api/users',
      response: expectedResponse
    };

    fakeFetch({
      fakeConfigs: [fakeConfig]
    });

    const response = await fetch('/api/users');

    expect(response).toEqual(expectedResponse);
  });

  it('should return 404 response', async () => {
    const expectedResponse = new Response(undefined, {
      status: 404,
      statusText: 'Not Found'
    });

    fakeFetch({
      fakeConfigs: []
    });

    const response = await fetch('/api/users');

    expect(response).toEqual(expectedResponse);
  });

  it('should return user defined 404 response', async () => {
    const expectedResponse = new Response(undefined, {
      status: 404,
      statusText: 'User defined 404 response'
    });

    fakeFetch({
      globalFakeConfig: {
        _404Response: expectedResponse
      },
      fakeConfigs: []
    });

    const response = await fetch('/api/users');

    expect(response).toEqual(expectedResponse);
  });

  it('should repect request options', async () => {
    const usersResponse = JSON.stringify({
      users: ['ameer', 'sudhanshu']
    });
    const expectedResponse = new Response(usersResponse);
    const fakeConfig: FakeConfig = {
      request: new Request('/api/users', {
        method: 'POST'
      }),
      response: expectedResponse
    };

    fakeFetch({
      fakeConfigs: [fakeConfig]
    });

    const response = await fetch('/api/users', {
      method: 'POST'
    });

    expect(response).toEqual(expectedResponse);
  });

  it('should repect local delay option', async () => {
    const usersResponse = JSON.stringify({
      users: ['ameer', 'sudhanshu']
    });
    const responseDelay = 2000;
    const expectedResponse = new Response(usersResponse);
    const fakeConfig: FakeConfig = {
      request: '/api/users',
      response: expectedResponse,
      delay: responseDelay
    };

    fakeFetch({
      globalFakeConfig: { delay: 4000 },
      fakeConfigs: [fakeConfig]
    });

    const startTime = Date.now();
    await fetch('/api/users');
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeGreaterThanOrEqual(responseDelay);
    expect(responseTime).toBeLessThanOrEqual(responseDelay + delayThresold);
  });

  it('should repect global delay option', async () => {
    const usersResponse = JSON.stringify({
      users: ['ameer', 'sudhanshu']
    });
    const responseDelay = 2000;
    const expectedResponse = new Response(usersResponse);
    const fakeConfig: FakeConfig = {
      request: '/api/users',
      response: expectedResponse
    };

    fakeFetch({
      globalFakeConfig: { delay: responseDelay },
      fakeConfigs: [fakeConfig]
    });

    const startTime = Date.now();
    await fetch('/api/users');
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeGreaterThanOrEqual(responseDelay);
    expect(responseTime).toBeLessThanOrEqual(responseDelay + delayThresold);
  });

  it('should throw when an error object is provied', async () => {
    const error = new Error('ETIMEOUT: the server timedout');
    const fakeConfig: FakeConfig = {
      request: '/api/users',
      error
    };

    fakeFetch({
      fakeConfigs: [fakeConfig]
    });

    try {
      await fetch('/api/users');
    } catch (err) {
      expect(err).toEqual(error);
    }
  });

  it('should throw when no error or response property is provied', async () => {
    const fakeConfig: FakeConfig = {
      request: '/api/users'
    };

    fakeFetch({
      fakeConfigs: [fakeConfig]
    });
    const expectedError = new Error(
      `fake for request /api/users must either contain an error or response property`
    );

    try {
      await fetch('/api/users');
    } catch (err) {
      expect(err).toEqual(expectedError);
    }
  });
});

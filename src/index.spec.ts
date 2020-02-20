import fakeFetch, { FakeConfig } from './index';

let a = 10;

describe('fakeFetch()', () => {
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
});

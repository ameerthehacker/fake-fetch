# Fake fetch &middot; [![ci-badge](https://github.com/ameerthehacker/fake-fetch/workflows/CI/badge.svg)](https://github.com/ameerthehacker/fake-fetch/actions)

If you hate spinning up a web server everytime you are building a small pet project or demo project then this is for you 🎉

## Features 💥

- fake GET/POST/PUT/DELETE fetch requests
- induce delay to any fetch request
- fake a 404 or error response
- generate response dynamically based on the request

## How to use ❓

1. Install it using npm

```sh
npm i --dev fake-fetch
```

1. Add it to your front-end project to fake a simple GET request

```js
import fakeFetch from 'fake-fetch';

...

if(process.env.NODE_ENV === 'development') {
  fakeFetch([{
    request: '/api/users/ameerthehacker',
    response: new Response(JSON.stringify({ name: "Ameer Jhan" })),
    // delay in milliseconds
    delay: 3000
  }]);
}

...

// will print { name: "Ameer Jhan" } after 3s
fetch('/api/users/ameerthehacker')
      .then(res => res.json())
      .then(user => console.log(user));
```

## API

### Faking a POST/PUT/DELETE request

```js
fakeFetch([
  {
    request: new Request('/api/users/create', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ameer Jhan',
        username: 'ameerthehacker'
      })
    }),
    response: new Response(JSON.stringify({ done: true }))
  }
]);
```

### Dynamic response based on request

```js
fakeFetch([
  {
    request: new Request('/api/add', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ameer' })
    }),
    response: async (request) => {
      const body = await request.json();

      return new Response(body.name.toLowerCase());
    }
  }
]);

fetch(`/api/add`, {
  body: JSON.stringify({ name: 'Ameer' })
})
  .then((res) => res.text())
  // this will print `ameer`
  .then((res) => console.log(res));
```

### Faking a request to throw an error

```js
const error = new Error('ETIMEOUT: the server timedout');

fakeFetch([
  {
    request: '/api/users',
    error
  }
]);

// this promise will get reject with `error`
fetch('/api/users').catch((err) => console.log(err));
```

### Inducing delay for all the requests

```js
fakeFetch({
  globalConfig: {
    delay: 3000
  },
  fakeConfigs: [
    {
      request: '/api/users/ameerthehacker',
      response: new Response(JSON.stringify({ name: 'Ameer Jhan' })),
      // local delay are given higher precedence
      delay: 5000
    }
  ]
});
```

### Customize 404 response

If **fakeFetch** could not find any **fake config** for a given request then it will return a default 404 response, you can also customize it as shown below

```js
const _404Response = new Response(undefined, {
      status: 404,
      statusText: 'User defined 404 response'
    });

fakeFetch({
  globalConfig: {
    _404Response
  },
  fakeConfigs: [...]
});
```

Show your support by ⭐️ the repo

## License

MIT © [Ameer Jhan](mailto:ameerjhanprof@gmail.com)

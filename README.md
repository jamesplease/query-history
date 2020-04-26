# query-history

A [history](https://github.com/ReactTraining/history) with additional APIs to more easily manage query parameters
using [query-string](https://github.com/sindresorhus/query-string).

## Installation

Install using [npm](https://www.npmjs.com):

```
npm install query-history
```

or [yarn](https://yarnpkg.com/):

```
yarn add query-history
```

## Guides

The following guides assume that you're using `query-history` with [React Router](https://github.com/ReactTraining/react-router).

### Getting Started

Create a history object using the default export from this library, `createQueryHistory`.

```js
import createQueryHistory from 'query-history';

const history = createQueryHistory();
```

`createQueryHistory` accepts all of the same option as `history`, so you can, for example, specify a `basename` option:

```js
const history = createQueryHistory({
  basename: '/my-app',
});
```

For more information on the available options, refer to the
[history docs](https://github.com/ReactTraining/history/blob/master/docs/GettingStarted.md).

Once you have a `history`, you can then pass it into a `Router` from React Router.

```jsx
import { Router } from 'react-router-dom';

// Later, in a component...
return (
  <Router history={history}>
    <App />
  </Router>
);
```

### Reading query parameters

When using this library, the `location` object includes a new key, `query`. This is
an object that represents the query parameters.

```js
import { useLocation } from 'react-router-dom';

export default function MyComponent() {
  const { query } = useLocation();

  console.log('What is the current query?', query);

  return null;
}
```

For instance, given the URL `https://app.com/?hello=true&sandwiches=tasty&size=40`, the value of `history.query` would be:

```js
{
  hello: 'true',
  sandwiches: 'tasty',
  size: '40'
}
```

Keep in mind that although this library will parse your query string as an object, the individual query string
values are always strings. Notice how the `size` parameter is parsed as the string `"40"` in the example above. You
are responsible for converting the values to their correct type in your application.

### Updating query parameters

The [`history`](https://github.com/ReactTraining/history) methods `push` and `replace` have been updated with improved
support for updating query parameters. Additionally, a new method, `updateQuery`, has been introduced.

Use `updateQuery` to change the query parameters without redirecting to a new path.

```js
import { useHistory } from 'react-router-dom';

export default function MyComponent() {
  const history = useHistory();

  function navigate() {
    history.updateQuery({
      sandwiches: 'tasty',
    });
  }

  return null;
}
```

This will merge the new params into the old. To replace the parameters, pass a second argument, `{ mergeQuery: false }`:

```js
history.updateQuery(
  {
    sandwiches: 'tasty',
  },
  {
    mergeQuery: false,
  }
);
```

When calling `push` or `replace`, pass an optional `query` object to specify new query parameters.

```js
import { useHistory } from 'react-router-dom';

export default function MyComponent() {
  const history = useHistory();

  function navigate() {
    history.push({
      pathname: '/',
      query: {
        sandwiches: 'tasty',
      },
    });
  }

  return null;
}
```

The new parameters that you pass are merged with the existing ones. To replace the parameters, pass `mergeQuery: false`
to `history.push` or `history.replace`:

```js
history.push({
  pathname: '/',
  query: {
    sandwiches: 'tasty',
  },
  mergeQuery: false,
});
```

### Configuring query parameter behavior

This library uses the [`query-string`](https://github.com/sindresorhus/query-string) library to parse and serialize query parameters. To configure this
behavior, pass `queryStringOptions` when calling `createQueryHistory`.

For example, if you would like to specify how arrays are serialized and parsed, you can specify the
[`arrayFormat`](https://github.com/sindresorhus/query-string#arrayformat) option like so:

```js
import createQueryHistory from 'query-history';

const history = createQueryHistory({
  queryStringOptions: {
    arrayFormat: 'comma',
  },
});
```

## Acknowledgements

This library was inspired by [qhistory](https://github.com/pshrmn/qhistory).

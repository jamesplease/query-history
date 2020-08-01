# query-history

[![Travis build status](http://img.shields.io/travis/jamesplease/query-history.svg?style=flat)](https://travis-ci.com/github/jamesplease/query-history)
[![npm version](https://img.shields.io/npm/v/query-history.svg)](https://www.npmjs.com/package/query-history)
[![Test Coverage](https://coveralls.io/repos/github/jamesplease/query-history/badge.svg?branch=master)](https://coveralls.io/github/jamesplease/query-history?branch=master)
[![gzip size](http://img.badgesize.io/https://unpkg.com/query-history/dist/index.js?compression=gzip)](https://unpkg.com/query-history/dist/index.js)

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

## Table of Contents

- [Guides](#guides)
  - [Getting Started](#getting-started)
  - [Reading Query Parameters](#reading-query-parameters)
  - [Updating Query Parameters](#updating-query-parameters)
  - [Removing Query Parameters](#removing-query-parameters)
  - [Configuring the Query Parameter Behavior](#configuring-query-parameter-behavior)
- [Acknowledgements](#acknowledgements)

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

Keep in mind that although this library will parse your query string as an object, by default the individual query string
values are always strings. Notice how the `size` parameter is parsed as the string `"40"` in the example above.

You are either responsible for converting the values to their correct type in your application, or you can [configure
`query-string`](https://github.com/jamesplease/query-history#configuring-query-parameter-behavior) to do it for you.

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

### Removing Query Parameters

You can remove query parameters by passing their value as `undefined`. For example:

```js
// Removes "sandwiches" from the query parameter list
history.updateQuery({
  sandwiches: undefined,
});
```

To learn more about how falsey values are parsed, refer to [the `query-string` docs](https://github.com/sindresorhus/query-string#falsy-values).

### Configuring query parameter behavior

This library uses the [`query-string`](https://github.com/sindresorhus/query-string) library to parse and serialize query parameters. To configure this
behavior, the `createQueryHistory` function accepts two options:

- [`parseOptions`](https://github.com/sindresorhus/query-string#parsestring-options): an object of options passed into `queryString.parse()`
- [`stringifyOptions`](https://github.com/sindresorhus/query-string#stringifyobject-options): an object of options passed into `queryString.stringify()`

Click the options name in the above list to view all of the supported options.

#### Example: automatically parsing numbers and booleans

By default, numbers and booleans in the query parameter are parsed as strings. You can configure this library to parse them
as their correct types using the following code:

```js
import createQueryHistory from 'query-history';

const history = createQueryHistory({
  parseOptions: {
    parseNumbers: true,
    parseBooleans: true,
  },
});
```

#### Example: configuring how arrays are serialized and parsed

Different applications have different requirements when it comes to serializing arrays, and `query-string` supports
a number of options. In this example, we set the array format to `"comma"`. View all of the options in
[the `query-string` docs](https://github.com/sindresorhus/query-string#arrayformat).

```js
import createQueryHistory from 'query-history';

const history = createQueryHistory({
  stringifyOptions: {
    arrayFormat: 'comma',
  },
  parseOptions: {
    arrayFormat: 'comma
  }
});
```

## Acknowledgements

This library was inspired by [qhistory](https://github.com/pshrmn/qhistory).

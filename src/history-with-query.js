// This code is based on the qhistory library:
// https://github.com/pshrmn/qhistory
// The API has been modified with an more robust query string API

export default function historyWithQuery(history, stringify, parse) {
  const addSearch = (location, prevLocation, mergeQuery) => {
    const isLocationObj = typeof location === 'object';
    const newQuery = isLocationObj ? location.query : {};

    const newLocation = isLocationObj
      ? location
      : {
          pathname: location,
        };

    let queryToUse;
    if (mergeQuery) {
      if (
        typeof location.query === 'object' ||
        typeof prevLocation.query === 'object'
      ) {
        queryToUse = {
          ...prevLocation.query,
          ...newQuery,
        };
      }
    } else {
      queryToUse = newQuery;
    }

    newLocation.search = queryToUse
      ? stringify(queryToUse)
      : location.search || '';

    return newLocation;
  };

  const addQuery = location => {
    const { search } = location;
    if (search) {
      location.query = parse(
        search.charAt(0) === '?' ? search.substring(1) : search
      );
    } else {
      location.query = {};
    }
  };

  const updateProperties = (history, queryHistory) => {
    const properties = ['location', 'length', 'entries', 'index', 'action'];
    properties.forEach(prop => {
      if (history.hasOwnProperty(prop)) {
        queryHistory[prop] = history[prop];
      }
    });
  };

  // make sure that the initial location has query support
  addQuery(history.location);

  const queryHistory = {
    ...history,
    push: (location, state) => {
      let mergeQuery = true;
      if (typeof location === 'object') {
        mergeQuery =
          typeof location.mergeQuery !== 'undefined'
            ? location.mergeQuery
            : true;
      }

      const loc = addSearch(location, history.location, mergeQuery);
      history.push(loc, state);
    },
    replace: (location, state) => {
      let mergeQuery = true;
      if (typeof location === 'object') {
        mergeQuery =
          typeof location.mergeQuery !== 'undefined'
            ? location.mergeQuery
            : true;
      }

      const loc = addSearch(location, history.location, mergeQuery);
      history.replace(loc, state);
    },

    updateQuery: (query, { mergeQuery = true } = {}) => {
      const location = {
        query,
        mergeQuery,
        pathname: history.location.pathname,
      };

      const loc = addSearch(location, history.location, mergeQuery);
      history.replace(loc);
    },
  };

  // This relies on being the first listener called by
  // the actual history instance. If you register a
  // listener on the history instance before modifying
  // it with qhistory, the location object will not have
  // the query property set on it when that listener
  // is called.
  history.listen(location => {
    addQuery(location);
    updateProperties(history, queryHistory);
  });

  return queryHistory;
}

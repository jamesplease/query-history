// This code is based on the qhistory library:
// https://github.com/pshrmn/qhistory
// The API has been modified with a more robust query string API

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

  const addQuery = (location) => {
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
    properties.forEach((prop) => {
      if (history.hasOwnProperty(prop)) {
        queryHistory[prop] = history[prop];
      }
    });
  };

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

  history.listen((location) => {
    addQuery(location);
    updateProperties(history, queryHistory);
  });

  return queryHistory;
}

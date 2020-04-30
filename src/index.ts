import {
  History,
  Location,
  createBrowserHistory,
  LocationState,
  BrowserHistoryBuildOptions,
  Path,
  LocationDescriptorObject,
} from 'history';
import queryString, {
  ParseOptions,
  StringifyOptions,
  ParsedQuery,
} from 'query-string';

export interface QueryObject {
  [key: string]: any;
}

type ReducedHistory = Omit<History, 'push' | 'replace' | 'location'>;

export interface QueryLocationDescriptorObject<HistoryLocationState>
  extends LocationDescriptorObject<HistoryLocationState> {
  mergeQuery?: boolean;
  query?: QueryObject;
}

export interface QueryHistory<Query, HistoryLocationState>
  extends ReducedHistory {
  updateQuery: (query: QueryObject, options?: { mergeQuery?: boolean }) => void;
  push(path: Path, state?: HistoryLocationState): void;
  push(location: QueryLocationDescriptorObject<HistoryLocationState>): void;
  replace(path: Path, state?: HistoryLocationState): void;
  replace(location: QueryLocationDescriptorObject<HistoryLocationState>): void;
  location: LocationWithQuery<Query, HistoryLocationState>;
}

export interface LocationWithQuery<Query, HistoryLocationState>
  extends Location<HistoryLocationState> {
  query: Query;
}

export interface CreateHistoryWithQueryOptions
  extends BrowserHistoryBuildOptions {
  stringifyOptions?: StringifyOptions;
  parseOptions?: ParseOptions;
}

export default function createHistoryWithQuery<
  Query = ParsedQuery<string>,
  HistoryLocationState = LocationState
>(
  options: CreateHistoryWithQueryOptions = {}
): QueryHistory<Query, HistoryLocationState> {
  const { stringifyOptions, parseOptions, ...rest } = options;

  const history = createBrowserHistory<HistoryLocationState>(rest);

  function getUpdatedQueryString(
    prevQueryString: string,
    mergeQuery: boolean,
    newQueryObject?: QueryObject
  ): string {
    if (mergeQuery === false && !newQueryObject) {
      return '';
    } else if (mergeQuery === false && newQueryObject) {
      return queryString.stringify(newQueryObject, stringifyOptions);
    } else {
      const previousQueryObject = queryString.parse(
        prevQueryString,
        parseOptions
      );
      const fullQueryObject = {
        ...previousQueryObject,
        ...newQueryObject,
      };

      return queryString.stringify(fullQueryObject, stringifyOptions);
    }
  }

  const convertLocationToQueryLocation = (
    location: Location<HistoryLocationState>
  ): LocationWithQuery<Query, HistoryLocationState> => {
    const { search } = location;

    const query = search
      ? ((queryString.parse(
          search.charAt(0) === '?' ? search.substring(1) : search,
          parseOptions
        ) as unknown) as Query)
      : (({} as unknown) as Query);

    return {
      ...location,
      query,
    };
  };

  const queryLocation = convertLocationToQueryLocation(history.location);

  const queryHistory: QueryHistory<Query, HistoryLocationState> = {
    ...history,
    location: queryLocation,
    push: (
      location: Path | QueryLocationDescriptorObject<HistoryLocationState>,
      state?: HistoryLocationState
    ): void => {
      let mergeQuery = true;
      if (typeof location === 'object') {
        mergeQuery =
          typeof location.mergeQuery !== 'undefined'
            ? location.mergeQuery
            : true;
      }

      const newQueryObject =
        typeof location === 'string' ? undefined : location.query;
      const newSearchString = getUpdatedQueryString(
        history.location.search,
        mergeQuery,
        newQueryObject
      );

      const pathname =
        typeof location === 'string' ? location : location.pathname;
      const hash = typeof location === 'string' ? undefined : location.hash;
      const newState = typeof location === 'string' ? state : location.state;

      history.push({
        pathname,
        hash,
        state: newState,
        search: newSearchString,
      });
    },
    replace: (
      location: Path | QueryLocationDescriptorObject<HistoryLocationState>,
      state?: HistoryLocationState
    ): void => {
      let mergeQuery = true;
      if (typeof location === 'object') {
        mergeQuery =
          typeof location.mergeQuery !== 'undefined'
            ? location.mergeQuery
            : true;
      }

      const newQueryObject =
        typeof location === 'string' ? undefined : location.query;
      const newSearchString = getUpdatedQueryString(
        history.location.search,
        mergeQuery,
        newQueryObject
      );

      const pathname =
        typeof location === 'string' ? location : location.pathname;
      const hash = typeof location === 'string' ? undefined : location.hash;
      const newState = typeof location === 'string' ? state : location.state;

      history.push({
        pathname,
        hash,
        state: newState,
        search: newSearchString,
      });
    },

    updateQuery: (query: QueryObject, options) => {
      let defaultMergeQuery = true;
      let mergeQuery =
        typeof options !== 'undefined' &&
        typeof options.mergeQuery === 'boolean'
          ? options.mergeQuery
          : defaultMergeQuery;

      const newSearchString = getUpdatedQueryString(
        history.location.search,
        mergeQuery,
        query
      );

      history.replace({
        pathname: history.location.pathname,
        search: newSearchString,
      });
    },
  };

  history.listen((location) => {
    queryHistory.location = convertLocationToQueryLocation(location);
    queryHistory.length = history.length;
    queryHistory.action = history.action;
  });

  return queryHistory;
}

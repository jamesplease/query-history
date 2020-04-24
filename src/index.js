import { createBrowserHistory } from 'history';
import queryString from 'query-string';
import historyWithQuery from './history-with-query';

export default function createHistoryWithQuery(options = {}) {
  const { queryStringOptions, ...rest } = options;

  return historyWithQuery(
    createBrowserHistory(rest),
    (val) => queryString.stringify(val, queryStringOptions),
    (val) => queryString.parse(val, queryStringOptions)
  );
}

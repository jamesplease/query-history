import { createBrowserHistory } from 'history';
import queryString from 'query-string';
import historyWithQuery from './history-with-query';

export default function createHistoryWithQuery(options = {}) {
  const { stringifyOptions, parseOptions, ...rest } = options;

  return historyWithQuery(
    createBrowserHistory(rest),
    (val) => queryString.stringify(val, stringifyOptions),
    (val) => queryString.parse(val, parseOptions)
  );
}

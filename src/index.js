import { createBrowserHistory } from 'history';
import queryString from 'query-string';
import historyWithQuery from './history-with-query';

export default function createHistoryWithQuery(basename, { arrayFormat } = {}) {
  return historyWithQuery(
    createBrowserHistory({
      basename,
    }),
    val => queryString.stringify(val, { arrayFormat }),
    val => queryString.parse(val, { arrayFormat })
  );
}

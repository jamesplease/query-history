import { History, Location, LocationDescriptorObject, Path } from 'history';

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

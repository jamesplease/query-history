import createQueryHistory from '../src';

// The purpose of this is to reset the state of the history object.
// The problem is...this approach is hacky, and subject to break. I learned of this
// approach here:
// https://github.com/facebook/jest/issues/5124#issuecomment-583092145
// A probably-better approach would be to access the JSDom object and use a method called
// "reconfigure". I've never done this, and folks in that thread seemed to have
// mixed results with that approach. Because this is a relatively small amount of code, I'll
// stick with this for now, but I'll likely need to revisit it sometimes in the future.
beforeEach(() => {
  delete global.location;

  // These are the minimum fields required for React Router's history to parse location properly.
  // see:
  // https://github.com/ReactTraining/history/blob/3f69f9e07b0a739419704cffc3b3563133281548/modules/createBrowserHistory.js#L55-L57
  global.location = {
    href: 'http://example.org/',
    pathname: '/',
    search: '',
    hash: '',
  };
});

describe('createQueryHistory', () => {
  it('is a function', () => {
    expect(typeof createQueryHistory).toBe('function');
  });

  describe('history shape', () => {
    it('returns the usual history interface', () => {
      const history = createQueryHistory();

      expect(history).toEqual(
        expect.objectContaining({
          push: expect.any(Function),
          replace: expect.any(Function),
          listen: expect.any(Function),
          length: expect.any(Number),
          location: expect.any(Object),
          action: expect.any(String),
        })
      );
    });

    it('includes additional APIs', () => {
      const history = createQueryHistory();

      expect(history).toEqual(
        expect.objectContaining({
          updateQuery: expect.any(Function),
        })
      );
    });
  });

  describe('queryString options', () => {
    describe('stringify()', () => {
      it('supports custom array formats', () => {
        const history = createQueryHistory({
          stringifyOptions: {
            arrayFormat: 'separator',
            arrayFormatSeparator: '|',
          },
        });

        expect(history.location.query).toEqual({});

        history.updateQuery({
          hungerLevel: [10, 25, 100],
        });

        expect(history.location.search).toEqual('?hungerLevel=10|25|100');
      });
    });

    describe('parse()', () => {
      it('supports parsing booleans', () => {
        delete global.location;
        global.location = {
          href: 'http://example.org/',
          search: '?pasta=true',
          hash: '',
        };

        const history = createQueryHistory({
          parseOptions: {
            parseBooleans: true,
          },
        });

        expect(history.location.query).toEqual({
          pasta: true,
        });
      });

      it('supports parsing numbers', () => {
        delete global.location;
        global.location = {
          href: 'http://example.org/',
          search: '?hungerLevel=24',
          hash: '',
        };

        const history = createQueryHistory({
          parseOptions: {
            parseNumbers: 24,
          },
        });

        expect(history.location.query).toEqual({
          hungerLevel: 24,
        });
      });

      it('supports custom array formats', () => {
        delete global.location;
        global.location = {
          href: 'http://example.org/',
          search: '?hungerLevel=24|31|20',
          hash: '',
        };

        const history = createQueryHistory({
          parseOptions: {
            arrayFormat: 'separator',
            arrayFormatSeparator: '|',
          },
        });

        expect(history.location.query).toEqual({
          hungerLevel: ['24', '31', '20'],
        });
      });
    });
  });

  describe('query params', () => {
    it('has an empty object by default when no params exist', () => {
      const history = createQueryHistory();
      expect(history.location.query).toEqual({});
    });

    it('parses existing query params', () => {
      delete global.location;
      global.location = {
        href: 'http://example.org/',
        search: '?pasta=true&hungerLevel=24',
        hash: '',
      };

      const history = createQueryHistory();
      expect(history.location.query).toEqual({
        pasta: 'true',
        hungerLevel: '24',
      });
    });

    describe('updateQuery()', () => {
      it('updates and merges query params by default', () => {
        const history = createQueryHistory();
        history.updateQuery({
          pasta: 'delicious',
        });

        expect(history.location.query).toEqual({
          pasta: 'delicious',
        });

        history.updateQuery({
          sandwiches: 'also yummy',
        });

        expect(history.location.query).toEqual({
          pasta: 'delicious',
          sandwiches: 'also yummy',
        });
      });

      it('can replace query params with a second options argument', () => {
        const history = createQueryHistory();
        history.updateQuery({
          pasta: 'delicious',
        });

        expect(history.location.query).toEqual({
          pasta: 'delicious',
        });

        history.updateQuery(
          {
            sandwiches: 'also yummy',
          },
          {
            mergeQuery: false,
          }
        );

        expect(history.location.query).toEqual({
          sandwiches: 'also yummy',
        });
      });
    });

    describe('push()', () => {
      it('works when passing a location string', () => {
        const history = createQueryHistory();

        expect(history.location.pathname).toEqual('/');
        expect(history.location.query).toEqual({});

        history.push('/soda');

        expect(history.location.pathname).toEqual('/soda');
      });

      it('works when passing a location object, no queries', () => {
        const history = createQueryHistory();

        expect(history.location.pathname).toEqual('/');
        expect(history.location.query).toEqual({});

        history.push({ pathname: '/soda' });

        expect(history.location.pathname).toEqual('/soda');
      });

      it('updates location and merges query parameters by default', () => {
        const history = createQueryHistory();

        expect(history.location.pathname).toEqual('/');
        expect(history.location.query).toEqual({});

        history.push({
          pathname: '/soda',
          query: {
            pasta: 'delicious',
          },
        });

        expect(history.location.pathname).toEqual('/soda');
        expect(history.location.query).toEqual({
          pasta: 'delicious',
        });

        history.push({
          pathname: '/bagel-bites',
          query: {
            healthy: false,
          },
        });

        expect(history.location.pathname).toEqual('/bagel-bites');
        expect(history.location.query).toEqual({
          pasta: 'delicious',
          healthy: 'false',
        });
      });

      it('can replace query parameters', () => {
        const history = createQueryHistory();

        expect(history.location.pathname).toEqual('/');
        expect(history.location.query).toEqual({});

        history.push({
          pathname: '/soda',
          query: {
            pasta: 'delicious',
          },
        });

        expect(history.location.pathname).toEqual('/soda');
        expect(history.location.query).toEqual({
          pasta: 'delicious',
        });

        history.push({
          pathname: '/bagel-bites',
          query: {
            healthy: false,
          },
          mergeQuery: false,
        });

        expect(history.location.pathname).toEqual('/bagel-bites');
        expect(history.location.query).toEqual({
          healthy: 'false',
        });
      });
    });

    describe('replace()', () => {
      it('works when passing a location string', () => {
        const history = createQueryHistory();

        expect(history.location.pathname).toEqual('/');
        expect(history.location.query).toEqual({});

        history.replace('/soda');

        expect(history.location.pathname).toEqual('/soda');
      });

      it('updates location and merges query parameters by default', () => {
        const history = createQueryHistory();

        expect(history.location.pathname).toEqual('/');
        expect(history.location.query).toEqual({});

        history.replace({
          pathname: '/soda',
          query: {
            pasta: 'delicious',
          },
        });

        expect(history.location.pathname).toEqual('/soda');
        expect(history.location.query).toEqual({
          pasta: 'delicious',
        });

        history.replace({
          pathname: '/bagel-bites',
          query: {
            healthy: false,
          },
        });

        expect(history.location.pathname).toEqual('/bagel-bites');
        expect(history.location.query).toEqual({
          pasta: 'delicious',
          healthy: 'false',
        });
      });

      it('can replace query parameters', () => {
        const history = createQueryHistory();

        expect(history.location.pathname).toEqual('/');
        expect(history.location.query).toEqual({});

        history.replace({
          pathname: '/soda',
          query: {
            pasta: 'delicious',
          },
        });

        expect(history.location.pathname).toEqual('/soda');
        expect(history.location.query).toEqual({
          pasta: 'delicious',
        });

        history.replace({
          pathname: '/bagel-bites',
          query: {
            healthy: false,
          },
          mergeQuery: false,
        });

        expect(history.location.pathname).toEqual('/bagel-bites');
        expect(history.location.query).toEqual({
          healthy: 'false',
        });
      });
    });
  });
});

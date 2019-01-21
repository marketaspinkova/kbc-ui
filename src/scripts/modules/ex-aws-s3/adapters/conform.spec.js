import Immutable from 'immutable';
import conform  from './conform';

describe('conform', function() {
  it('should remove columns property from processor-create-manifest if columns_from is set to header', function() {
    const configuration = {
      parameters: {
        path: ''
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              folder: ''
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: false,
              primary_key: [],
              columns: [],
              columns_from: 'header'
            }
          },
          {
            definition: {
              component: 'keboola.processor-skip-lines'
            },
            parameters: {
              lines: 1
            }
          }
        ]
      }
    };
    const expected = {
      parameters: {
        path: ''
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              folder: ''
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: false,
              primary_key: [],
              columns_from: 'header'
            }
          },
          {
            definition: {
              component: 'keboola.processor-skip-lines'
            },
            parameters: {
              lines: 1
            }
          }
        ]
      }
    };
    expect(expected).toEqual(conform(Immutable.fromJS(configuration)).toJS());
  });
  it('should remove columns property from processor-create-manifest if columns_from is set to auto', function() {
    const configuration = {
      parameters: {
        path: ''
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              folder: ''
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: false,
              primary_key: [],
              columns: [],
              columns_from: 'auto'
            }
          },
          {
            definition: {
              component: 'keboola.processor-skip-lines'
            },
            parameters: {
              lines: 1
            }
          }
        ]
      }
    };
    const expected = {
      parameters: {
        path: ''
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              folder: ''
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: false,
              primary_key: [],
              columns_from: 'auto'
            }
          },
          {
            definition: {
              component: 'keboola.processor-skip-lines'
            },
            parameters: {
              lines: 1
            }
          }
        ]
      }
    };
    expect(expected).toEqual(conform(Immutable.fromJS(configuration)).toJS());
  });

  it('should not remove columns property from processor-create-manifest if columns_from is not set', function() {
    const configuration = {
      parameters: {
        path: ''
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              folder: ''
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: false,
              primary_key: [],
              columns: []
            }
          },
          {
            definition: {
              component: 'keboola.processor-skip-lines'
            },
            parameters: {
              lines: 1
            }
          }
        ]
      }
    };
    const expected = {
      parameters: {
        path: ''
      },
      processors: {
        after: [
          {
            definition: {
              component: 'keboola.processor-move-files'
            },
            parameters: {
              direction: 'tables',
              folder: ''
            }
          },
          {
            definition: {
              component: 'keboola.processor-create-manifest'
            },
            parameters: {
              delimiter: ',',
              enclosure: '"',
              incremental: false,
              primary_key: [],
              columns: []
            }
          },
          {
            definition: {
              component: 'keboola.processor-skip-lines'
            },
            parameters: {
              lines: 1
            }
          }
        ]
      }
    };
    expect(expected).toEqual(conform(Immutable.fromJS(configuration)).toJS());
  });
});

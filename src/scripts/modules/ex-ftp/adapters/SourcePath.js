import Immutable from 'immutable';

const createConfiguration = function(localState) {
  let processors = Immutable.List([]);

  // DECOMPRESS
  if (localState.get('decompress', false) === true) {
    let decompressProcessor = Immutable.fromJS({
      definition: {
        component: 'keboola.processor-decompress'
      }
    });
    processors = processors.push(decompressProcessor);
  }

  // MOVE FILES
  processors = processors.push(Immutable.fromJS(
    {
      definition: {
        component: 'keboola.processor-move-files'
      },
      parameters: {
        direction: 'tables',
        addCsvSuffix: true,
        folder: localState.get('name', '')
      }
    }
  ));

  // CREATE MANIFEST
  let createManifestProcessor = Immutable.fromJS({
    definition: {
      component: 'keboola.processor-create-manifest'
    },
    parameters: {
      delimiter: localState.get('delimiter', ','),
      enclosure: localState.get('enclosure', '"'),
      incremental: localState.get('incremental', false),
      primary_key: localState.get('primaryKey', Immutable.List())
    }
  });
  if (localState.get('columnsFrom', 'header') === 'header') {
    createManifestProcessor = createManifestProcessor.setIn(['parameters', 'columns_from'], 'header');
  } else if (localState.get('columnsFrom') === 'auto') {
    createManifestProcessor = createManifestProcessor.setIn(['parameters', 'columns_from'], 'auto');
  } else if (localState.get('columnsFrom', 'manual') === 'manual') {
    createManifestProcessor = createManifestProcessor.setIn(['parameters', 'columns'], localState.get('columns', Immutable.List()));
  }
  processors = processors.push(createManifestProcessor);

  // SKIP FIRST LINE
  if (localState.get('columnsFrom', 'header') === 'header') {
    processors = processors.push(
      Immutable.fromJS({
        definition: {
          component: 'keboola.processor-skip-lines'
        },
        parameters: {
          lines: 1
        }
      })
    );
  }

  // ADD ROW NUMBER
  if (localState.get('addRowNumberColumn')) {
    processors = processors.push(Immutable.fromJS(
      {
        definition: {
          component: 'keboola.processor-add-row-number-column'
        },
        parameters: {
          column_name: 'ftp_row_number'
        }
      }
    ));
  }

  // ADD FILE NAME COLUMN
  if (localState.get('addFilenameColumn')) {
    processors = processors.push(Immutable.fromJS(
      {
        definition: {
          component: 'keboola.processor-add-filename-column'
        },
        parameters: {
          column_name: 'ftp_filename'
        }
      }
    ));
  }

  let config = Immutable.fromJS({
    parameters: {
      onlyNewFiles: localState.get('onlyNewFiles', false),
      path: localState.get('path', '')
    }
  });

  config = config.setIn(['processors', 'after'], processors);

  return config;
};

const parseConfiguration = function(configuration) {
  const processorCreateManifest = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-create-manifest';
  }, null, Immutable.Map());
  const processorDecompress = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-decompress';
  });
  const processorAddRowNumberColumn = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-add-row-number-column' &&
      processor.getIn(['parameters', 'column_name']) === 'ftp_row_number';
  });
  const processorAddFilenameColumn = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-add-filename-column' &&
      processor.getIn(['parameters', 'column_name']) === 'ftp_filename';
  });
  const processorMoveFiles = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-move-files';
  }, null, Immutable.Map());
  let columnsFrom = processorCreateManifest.getIn(['parameters', 'columns_from'], 'header');
  if (processorCreateManifest.hasIn(['parameters', 'columns'])) {
    columnsFrom = 'manual';
  }
  return Immutable.fromJS({
    path: configuration.getIn(['parameters', 'path'], ''),
    name: processorMoveFiles.getIn(['parameters', 'folder'], ''),
    onlyNewFiles: configuration.getIn(['parameters', 'onlyNewFiles'], ''),
    incremental: processorCreateManifest.getIn(['parameters', 'incremental'], false),
    primaryKey: processorCreateManifest.getIn(['parameters', 'primary_key'], Immutable.List()).toJS(),
    delimiter: processorCreateManifest.getIn(['parameters', 'delimiter'], ','),
    enclosure: processorCreateManifest.getIn(['parameters', 'enclosure'], '"'),
    columns: processorCreateManifest.getIn(['parameters', 'columns'], Immutable.List()).toJS(),
    columnsFrom: columnsFrom,
    decompress: processorDecompress ? true : false,
    addRowNumberColumn: processorAddRowNumberColumn ? true : false,
    addFilenameColumn: processorAddFilenameColumn ? true : false
  });
};

const createEmptyConfiguration = function(name, webalizedName) {
  return createConfiguration(Immutable.fromJS({onlyNewFiles: false, name: webalizedName}));
};

export default {
  createConfiguration: createConfiguration,
  parseConfiguration: parseConfiguration,
  createEmptyConfiguration: createEmptyConfiguration
};

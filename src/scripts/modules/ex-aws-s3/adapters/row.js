import Immutable from 'immutable';

export function createConfiguration(localState) {
  let skipLinesProcessor;
  let decompressProcessor;
  let flattenFoldersProcessor;
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
    skipLinesProcessor = Immutable.fromJS({
      definition: {
        component: 'keboola.processor-skip-lines'
      },
      parameters: {
        lines: 1
      }
    });
  } else if (localState.get('columnsFrom') === 'auto') {
    createManifestProcessor = createManifestProcessor.setIn(['parameters', 'columns_from'], 'auto');
  } else if (localState.get('columnsFrom', 'manual') === 'manual') {
    createManifestProcessor = createManifestProcessor.setIn(['parameters', 'columns'], localState.get('columns', Immutable.List()));
  }

  if (localState.get('decompress', false) === true) {
    decompressProcessor = Immutable.fromJS({
      definition: {
        component: 'keboola.processor-decompress'
      }
    });
    flattenFoldersProcessor = Immutable.fromJS({
      definition: {
        component: 'keboola.processor-flatten-folders'
      },
      parameters: {
        starting_depth: 1
      }
    });
  }

  let config = Immutable.fromJS({
    parameters: {
      bucket: localState.get('bucket', ''),
      key: localState.get('key', '') + (localState.get('wildcard', false) ? '*' : ''),
      includeSubfolders: localState.get('subfolders', false),
      newFilesOnly: localState.get('newFilesOnly', false)
    },
    processors: {
      after: []
    }
  });

  let processors = Immutable.List([]);

  if (decompressProcessor) {
    processors = processors.push(decompressProcessor);
  }
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
  if (flattenFoldersProcessor) {
    processors = processors.push(flattenFoldersProcessor);
  }

  processors = processors.push(createManifestProcessor);

  if (skipLinesProcessor) {
    processors = processors.push(skipLinesProcessor);
  }

  if (localState.get('addRowNumberColumn')) {
    processors = processors.push(Immutable.fromJS(
      {
        definition: {
          component: 'keboola.processor-add-row-number-column'
        },
        parameters: {
          column_name: 's3_row_number'
        }
      }
    ));
  }

  if (localState.get('addFilenameColumn')) {
    processors = processors.push(Immutable.fromJS(
      {
        definition: {
          component: 'keboola.processor-add-filename-column'
        },
        parameters: {
          column_name: 's3_filename'
        }
      }
    ));
  }

  config = config.setIn(['processors', 'after'], processors);

  return config;
}

export function parseConfiguration(configuration) {
  const key = configuration.getIn(['parameters', 'key'], '');
  const isWildcard = key.slice(-1) === '*' ? true : false;
  const processorCreateManifest = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-create-manifest';
  }, null, Immutable.Map());
  const processorDecompress = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-decompress';
  });
  const processorAddRowNumberColumn = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-add-row-number-column' &&
      processor.getIn(['parameters', 'column_name']) === 's3_row_number';
  });
  const processorAddFilenameColumn = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-add-filename-column' &&
      processor.getIn(['parameters', 'column_name']) === 's3_filename';
  });
  const processorMoveFiles = configuration.getIn(['processors', 'after'], Immutable.List()).find(function(processor) {
    return processor.getIn(['definition', 'component']) === 'keboola.processor-move-files';
  }, null, Immutable.Map());

  let columnsFrom = processorCreateManifest.getIn(['parameters', 'columns_from'], 'header');
  if (processorCreateManifest.hasIn(['parameters', 'columns'])) {
    columnsFrom = 'manual';
  }

  return Immutable.fromJS({
    bucket: configuration.getIn(['parameters', 'bucket'], ''),
    key: isWildcard ? key.substring(0, key.length - 1) : key,
    name: processorMoveFiles.getIn(['parameters', 'folder'], ''),
    wildcard: isWildcard,
    subfolders: configuration.getIn(['parameters', 'includeSubfolders'], false),
    incremental: processorCreateManifest.getIn(['parameters', 'incremental'], false),
    newFilesOnly: configuration.getIn(['parameters', 'newFilesOnly'], false),
    primaryKey: processorCreateManifest.getIn(['parameters', 'primary_key'], Immutable.List()).toJS(),
    delimiter: processorCreateManifest.getIn(['parameters', 'delimiter'], ','),
    enclosure: processorCreateManifest.getIn(['parameters', 'enclosure'], '"'),
    columns: processorCreateManifest.getIn(['parameters', 'columns'], Immutable.List()).toJS(),
    columnsFrom: columnsFrom,
    decompress: processorDecompress ? true : false,
    addRowNumberColumn: processorAddRowNumberColumn ? true : false,
    addFilenameColumn: processorAddFilenameColumn ? true : false
  });
}

export function createEmptyConfiguration(name, webalizedName) {
  return createConfiguration(Immutable.fromJS({name: webalizedName}));
}

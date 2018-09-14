RoutesStore = require '../../../stores/RoutesStore'
ComponentsStore = require '../stores/ComponentsStore'

COMPONENTS_WITHOUT_API = ['tde-exporter', 'geneea-topic-detection',
'geneea-language-detection', 'geneea-lemmatization', 'geneea-sentiment-analysis',
'geneea-text-correction', 'geneea-entity-recognition', 'ex-adform', 'geneea-nlp-analysis',
'rcp-anomaly', 'rcp-basket', 'rcp-correlations', 'rcp-data-type-assistant',
'rcp-distribution-groups', 'rcp-linear-dependency', 'rcp-linear-regression',
'rcp-next-event', 'rcp-next-order-simple',
'rcp-segmentation', 'rcp-var-characteristics', 'ex-sklik', 'ex-dropbox', 'wr-portal-sas', 'ag-geocoding',
'keboola.ex-db-pgsql', 'keboola.ex-db-db2', 'keboola.ex-db-firebird']


module.exports = (componentId) ->
  componentId not in COMPONENTS_WITHOUT_API

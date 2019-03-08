const COMPONENTS_WITHOUT_API = [
  'tde-exporter',
  'geneea-topic-detection',
  'geneea-language-detection',
  'geneea-lemmatization',
  'geneea-sentiment-analysis',
  'geneea-text-correction',
  'geneea-entity-recognition',
  'ex-adform',
  'geneea-nlp-analysis',
  'rcp-anomaly',
  'rcp-basket',
  'rcp-correlations',
  'rcp-data-type-assistant',
  'rcp-distribution-groups',
  'rcp-linear-dependency',
  'rcp-linear-regression',
  'rcp-next-event',
  'rcp-next-order-simple',
  'rcp-segmentation',
  'rcp-var-characteristics',
  'ex-sklik',
  'ag-geocoding',
  'keboola.ex-db-pgsql',
  'keboola.ex-db-db2',
  'keboola.ex-db-firebird'
];

export default componentId => {
  return !COMPONENTS_WITHOUT_API.includes(componentId);
};

const languageOptions = [
  {
    label: 'English',
    value: 'en'
  },
  {
    label: 'Czech',
    value: 'cs'
  },
  {
    label: 'Slovak',
    value: 'sk'
  },
  {
    label: 'German',
    value: 'de'
  },
  {
    label: 'Spanish',
    value: 'es'
  },
  {
    label: 'Polish',
    value: 'pl'
  },
  {
    label: 'autodetect',
    value: ''
  }
];

const analysisTypes = {
  tags: {
    name: 'Tags',
    description:
      'The objective of a topic tag is to describe the content of a text whether it is an email, commercial contract, or a news article. A tag can be cancel subscription, safe car, or terrible cook. Again, we can easily adjust tags to your domain and to your needs.'
  },

  entities: {
    name: 'Entities',
    description:
      'Search your texts for names of people, locations, products, dates, account numbers, etc. We can adjust the detectors to your needs (e.g. taking into account your products) or even identify a new type of entity whether it should be financial products or offending expressions.'
  },

  sentiment: {
    name: 'Sentiment',
    description:
      'Detect the emotions contained in the text. Was the author happy (I loved it.), neutral (We went to London.) or unhappy (The lunch was not good at all.) with their experience? You can detect sentiment of reviews, feedback or customer service inquiries.'
  },

  relations: {
    name: 'Relations',
    description:
      'Extract basic attributes of events and properties of things. For example: recommend(SUBJECT:I, OBJECT:scrambled eggs) or burnt(OBJECT:pizza)'
  }
};

export { languageOptions, analysisTypes };

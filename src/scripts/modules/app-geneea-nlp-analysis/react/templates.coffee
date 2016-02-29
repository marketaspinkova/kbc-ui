module.exports =
  languageOptions: [
      label: 'English',
      value: 'en'
  ,
      label: 'Czech',
      value: 'cs'
  ]

  analysisTypes:
    hashtags:
      name: 'Tagging',
      description: 'Describe the contents of your text (an email, commercial contract, \
      or a yellow press article) using hashtags. A hashtag can be _cancel subscription_, _safe car_, or _terrible cook_.
      We can adjust hashtags to your domain, to your needs.'

    entities:
      name: 'Extract Entities',
      description: 'Search your texts for names of people, locations, products, dates, account numbers, etc.
      Again, the detectors can be tailor-made (e.g. taking into account your products). \
      It is even possible to identify a new entity type whether it is financial products or offending expressions.'

    topic:
      name: 'Identify topic/Categorize',
      description: 'Detect a broad topic of any text (News, Sport, Technology, Art, …). \
      We can train a custom model assigning exactly the categories you need (support, billing, cancelations, …).'


    language:
      name: 'Identify language',
      description: 'Detect the language of a text. Currently, English and Czech are distinguished;\
       tens of other languages coming soon.'

    lemmatize:
      name: 'Lemmatize',
      description: 'Turn all the words into their dictionary forms. For example, \
      for _I saw him going home_ the result is _I see he go home_. \
      This makes your text easier to process, whether you want to find keywords, \
      or apply prediction or clustering algorithms.'

    correction:
      name: 'Add diacritics',
      description: 'Add all the wedges and accents to Czech texts where diacritics are missing. \
      For example, for _Muj ctyrnohy pritel_ > _Můj čtyřnohý přítel_.'

    sentiment:
      name: 'Detect Sentiment',
      description: 'Detect the emotions contained in a text. Was its author happy (_I loved it._), \
      neutral (_We left on Tuesday._), or unhappy (_The lunch was not good at all._) with their experience? \
      You can detect sentiment of reviews, feedback or customer service inquiries.
      The model can be tuned to a particular domain if needed. '

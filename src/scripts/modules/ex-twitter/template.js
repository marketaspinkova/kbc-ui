import {fromJS, List, Map, Iterable} from 'immutable';

function fromJsOrdered(json) {
  return fromJS(json, function(key, value) {
    var isIndexed = Iterable.isIndexed(value);
    return isIndexed ? value.toList() : value.toOrderedMap();
  });
}

const common = {
  'api': {
    'authentication': {'type': 'oauth10'},
    'baseUrl': 'https://api.twitter.com/1.1/',
    'pagination': {
      'method': 'multiple',
      'scrollers': {
        'param_next_cursor': {
          'method': 'response.param',
          'responseParam': 'next_cursor',
          'queryParam': 'cursor'
        },
        'url_next_results': {
          'method': 'response.url',
          'urlKey': 'search_metadata.next_results',
          'paramIsQuery': true
        },
        'cursor_timeline': {
          'method': 'cursor',
          'idKey': 'id',
          'param': 'max_id',
          'reverse': true,
          'increment': -1
        }
      }
    },
    'http': {'defaultOptions': {'params': {'count': 200}}}
  },
  'config': {
    'incrementalOutput': true,
    'jobs': []
  }
};

const userDataMapping = {
  'id': {
    'mapping': {
      'destination': 'id',
      'primaryKey': true
    }
  },
  'name': {
    'mapping': {
      'destination': 'name'
    }
  },
  'screen_name': {
    'mapping': {
      'destination': 'screen_name'
    }
  },
  'created_at': {
    'mapping': {
      'destination': 'created_at'
    }
  },
  'description': {
    'mapping': {
      'destination': 'description'
    }
  },
  'favourites_count': {
    'mapping': {
      'destination': 'favourites_count'
    }
  },
  'followers_count': {
    'mapping': {
      'destination': 'followers_count'
    }
  },
  'friends_count': {
    'mapping': {
      'destination': 'friends_count'
    }
  },
  'lang': {
    'mapping': {
      'destination': 'lang'
    }
  },
  'location': {
    'mapping': {
      'destination': 'location'
    }
  },
  'statuses_count': {
    'mapping': {
      'destination': 'statuses_count'
    }
  },
  'keboola_source': {
    'type': 'user',
    'mapping': {
      'destination': 'keboola_source'
    }
  }
};

const tweetDataMapping = {
  'id': {
    'mapping': {
      'destination': 'id',
      'primaryKey': true
    }
  },
  'entities.hashtags': {
    'type': 'table',
    'destination': 'tweets-hashtags',
    'tableMapping': {
      'text': {
        'mapping': {
          'destination': 'text',
          'primaryKey': true
        }
      }
    },
    'parentKey': {
      'primaryKey': true
    }
  },
  'entities.user_mentions': {
    'type': 'table',
    'destination': 'tweets-user-mentions',
    'tableMapping': {
      'name': {
        'mapping': {
          'destination': 'name'
        }
      },
      'screen_name': {
        'mapping': {
          'destination': 'screen_name'
        }
      },
      'id': {
        'mapping': {
          'destination': 'user_id',
          'primaryKey': true
        }
      }
    },
    'parentKey': {
      'primaryKey': true
    }
  },
  'entities.urls': {
    'type': 'table',
    'destination': 'tweets-urls',
    'tableMapping': {
      'url': {
        'mapping': {
          'destination': 'url',
          'primaryKey': true
        }
      },
      'expanded_url': {
        'mapping': {
          'destination': 'expanded_url'
        }
      },
      'display_url': {
        'mapping': {
          'destination': 'display_url'
        }
      }
    },
    'parentKey': {
      'primaryKey': true
    }
  },
  'created_at': {
    'mapping': {
      'destination': 'created_at'
    }
  },
  'favorite_count': {
    'mapping': {
      'destination': 'favorite_count'
    }
  },
  'in_reply_to_screen_name': {
    'mapping': {
      'destination': 'in_reply_to_screen_name'
    }
  },
  'in_reply_to_status_id': {
    'mapping': {
      'destination': 'in_reply_to_status_id'
    }
  },
  'in_reply_to_user_id': {
    'mapping': {
      'destination': 'in_reply_to_user_id'
    }
  },
  'lang': {
    'mapping': {
      'destination': 'lang'
    }
  },
  'quoted_status_id': {
    'mapping': {
      'destination': 'quoted_status_id'
    }
  },
  'retweet_count': {
    'mapping': {
      'destination': 'retweet_count'
    }
  },
  'retweeted_status.id': {
    'mapping': {
      'destination': 'retweeted_status_id'
    }
  },
  'retweeted_status': {
    'type': 'table',
    'destination': 'tweets',
    'parentKey': {
      'disable': true
    }
  },
  'source': {
    'mapping': {
      'destination': 'source'
    }
  },
  'text': {
    'mapping': {
      'destination': 'text'
    }
  },
  'truncated': {
    'mapping': {
      'destination': 'truncated'
    }
  },
  'withheld_copyright': {
    'mapping': {
      'destination': 'withheld_copyright'
    }
  },
  'user.id': {
    'mapping': {
      'destination': 'user_id'
    }
  },
  'user': {
    'type': 'table',
    'destination': 'users',
    'tableMapping': userDataMapping,
    'parentKey': {
      'disable': true
    }
  },
  'keboola_source': {
    'type': 'user',
    'mapping': {
      'destination': 'keboola_source'
    }
  }
};

const searchTemplate = {
  'endpoint': 'search/tweets.json',
  'dataType': 'tweets',
  'params': {
    'q': '',
    'result_type': 'recent'
  },
  'scroller': 'cursor_timeline',
  'userData': {
    'keboola_source': 'search'
  },
  'dataMapping': tweetDataMapping
};

const userTimelineTemplate = {
  'endpoint': 'statuses/user_timeline.json',
  'scroller': 'cursor_timeline',
  'dataType': 'tweets',
  'userData': {
    'keboola_source': 'userTimeline'
  },
  'params': {
    'screen_name': ''
  },
  'dataMapping': tweetDataMapping
};

const mentionsTemplate = {
  'endpoint': 'statuses/mentions_timeline.json',
  'scroller': 'cursor_timeline',
  'dataType': 'tweets',
  'userData': {
    'keboola_source': 'mentions'
  },
  'params': {
    'include_entities': true,
    'contributor_details': false,
    'include_rts': false
  },
  'dataMapping': tweetDataMapping
};


const followersTemplate = {
  'endpoint': 'followers/list.json',
  'scroller': 'param_next_cursor',
  'dataType': 'users',
  'userData': {
    'keboola_source': 'followersList'
  },
  'params': {
    'skip_status': true,
    'include_user_entities': false,
    'screen_name': ''
  },
  'dataMapping': userDataMapping
};

export function createConfigurationFromSettings(settings) {
  let jobs = List();

  if (settings.get('userTimelineScreenName')) {
    jobs = jobs.push(fromJsOrdered(userTimelineTemplate).setIn(['params', 'screen_name'], settings.get('userTimelineScreenName')));
  }

  if (settings.getIn(['search', 'query'])) {
    jobs = jobs.push(fromJsOrdered(searchTemplate).setIn(['params', 'q'], settings.getIn(['search', 'query'])));
  }

  if (settings.get('followersScreenName')) {
    jobs = jobs.push(fromJsOrdered(followersTemplate).setIn(['params', 'screen_name'], settings.get('followersScreenName')));
  }

  jobs = jobs.push(fromJsOrdered(mentionsTemplate));
  return fromJsOrdered(common).setIn(['config', 'jobs'], jobs);
}

export function getSettingsFromConfiguration(configuration) {
  const jobs = configuration.getIn(['config', 'jobs'], List());
  const userTimeline = jobs.find((job) => job.get('endpoint') === 'statuses/user_timeline.json', this, Map()),
    followers = jobs.find((job) => job.get('endpoint') === 'followers/list.json', this, Map()),
    search = jobs.find((job) => job.get('endpoint') === 'search/tweets.json', this, Map());

  return Map({
    userTimelineScreenName: userTimeline.getIn(['params', 'screen_name'], ''),
    followersScreenName: followers.getIn(['params', 'screen_name'], ''),
    search: Map({
      query: search.getIn(['params', 'q'], '')
    })
  });
}
Immutable = require('immutable')
StoreUtils = require('../../../utils/StoreUtils')
Constants = require('../Constants')
Dispatcher = require '../../../Dispatcher'
getComponentId = require '../../jobs/getJobComponentId'
_ = require('underscore')

Map = Immutable.Map
List = Immutable.List

_store = Map(
  jobsById: Map()
  loadingJobs: List()
  terminatingJobs: List() # waiting for terminate request send
  query: ''
  isLoading: false
  isLoaded: false
  isLoadMore: true
  loadJobsErrorCnt: 0
  limit: 50
  offset: 0
  )

JobsStore = StoreUtils.createStore
  getJobsFiltered: ->
    filter = _store.get 'query'
    if not filter
      return getAll()

  loadJobsErrorCount: ->
    _store.get('loadJobsErrorCnt', 0)

  getAll: ->
    _store
      .get('jobsById')
      .sortBy( (job) ->
        date = job.get 'createdTime'
        if date then -1 * (new Date(date).getTime()) else null
        )

  get: (id) ->
    _store.getIn ['jobsById', id]

  has: (id) ->
    _store.hasIn ['jobsById', id]

  getIsLoading: ->
    _store.get 'isLoading'

  getIsLoaded: ->
    _store.get 'isLoaded'

  getQuery: ->
    _store.get 'query'

  getLimit: ->
    _store.get 'limit'

  getOffset: ->
    _store.get 'offset'

  getNextOffset: ->
    _store.get('offset') + _store.get('limit')

  getIsLoadMore: ->
    _store.get 'isLoadMore'

  getIsJobLoading: (jobId) ->
    _store.get('loadingJobs').contains jobId

  getIsJobTerminating: (jobId) ->
    _store.get('terminatingJobs').contains jobId



JobsStore.dispatchToken = Dispatcher.register (payload) ->
  action = payload.action

  switch action.type
    when Constants.ActionTypes.JOB_LOAD
      jobId = action.jobId
      _store = _store.update 'loadingJobs', (loadingJobs) ->
        loadingJobs.push jobId
      JobsStore.emitChange()
    when Constants.ActionTypes.JOBS_LOAD
      _store = _store.set 'isLoading', true
      JobsStore.emitChange()

    when Constants.ActionTypes.JOBS_LOAD_ERROR
      _store = _store.delete 'isLoading'
      status = action.exception?.response?.status
      errorCount = _store.get('loadJobsErrorCnt', 0)
      if status == 401
        _store = _store.set('loadJobsErrorCnt', errorCount + 1)
      JobsStore.emitChange()

    #LOAD MORE JOBS FROM API and merge with current jobs
    when Constants.ActionTypes.JOBS_LOAD_SUCCESS
      limit = _store.get 'limit'
      jobs = Immutable.fromJS(action.jobs).toMap()
      if action.resetJobs
        _store = _store.set('jobsById', Map())
      _store = _store.withMutations((store) ->
        store
          .set('loadJobsErrorCnt', 0)
          .set('isLoading', false)
          .set('isLoaded', true)
          .set('offset', action.newOffset)
          .mergeIn(['jobsById'],
            jobs.map (job) ->
              job.set 'id', parseInt(job.get('id')) # dokud to miro nefixne na backendu
            .mapKeys (key, job) ->
              job.get 'id'
          )
      )

      loadMore = true
      offset = _store.get('offset')
      if _store.get('jobsById').count() < (offset + limit)
        loadMore = false
      _store = _store.set('isLoadMore', loadMore)
      JobsStore.emitChange()

    #RESET QUERY and OFFSET and jobs
    when Constants.ActionTypes.JOBS_SET_QUERY
      _store = _store.withMutations((store) ->
        store
          .set('query', action.query.trim())
          .set('offset', 0)
          #.set('jobsById', Map())
      )
      JobsStore.emitChange()


    when Constants.ActionTypes.JOB_LOAD_SUCCESS
      previous = JobsStore.get action.job.id

      _store = _store.withMutations (store) ->
        job = Immutable.fromJS(action.job)
        job.set 'id', parseInt(job.get 'id')
        store = store
          .setIn ['jobsById', action.job.id], job
          .update 'loadingJobs', (loadingJobs) ->
            loadingJobs.remove(loadingJobs.indexOf(action.job.id))

        store

      JobsStore.emitChange()

    when Constants.ActionTypes.JOB_TERMINATE_START
      _store = _store.update 'terminatingJobs', (jobs) ->
        jobs.push action.jobId
      JobsStore.emitChange()

    when Constants.ActionTypes.JOB_TERMINATE_SUCCESS, Constants.ActionTypes.JOB_TERMINATE_ERROR
      _store = _store.update 'terminatingJobs', (jobs) ->
        jobs.remove(jobs.indexOf(action.jobId))
      JobsStore.emitChange()

module.exports = JobsStore

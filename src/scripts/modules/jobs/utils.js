const getJobComponentId = (job) => {
  return job.getIn(['params', 'component'], job.get('component'));
};

export { getJobComponentId };

import { fromJS } from 'immutable';

export const validSimple = fromJS({
  storage: {
    input: {
      tables: [
        {
          changed_since: ''
        }
      ]
    }
  },
  parameters: {
    mode: 'recreate'
  }
});

export const incrementalTrue = fromJS({
  storage: {
    input: {
      tables: [
        {
          changed_since: ''
        }
      ]
    }
  },
  parameters: {
    incremental: true
  }
});

export const incrementalTrueExpected = fromJS({
  storage: {
    input: {
      tables: [
        {
          changed_since: ''
        }
      ]
    }
  },
  parameters: {
    mode: 'update'
  }
});

export const incrementalFalse = fromJS({
  storage: {
    input: {
      tables: [
        {
          changed_since: ''
        }
      ]
    }
  },
  parameters: {
    incremental: false
  }
});

export const incrementalFalseExpected = fromJS({
  storage: {
    input: {
      tables: [
        {
          changed_since: ''
        }
      ]
    }
  },
  parameters: {
    mode: 'replace'
  }
});

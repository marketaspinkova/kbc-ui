import {parse} from './tableIdParser';

describe('tableIdParser', () => {
  it('should parse null input', function() {
    const parsed = parse(null);
    expect('..').toEqual(parsed.tableId);
    const {stage, bucket, table} = parsed.parts;
    expect('').toEqual(stage);
    expect('').toEqual(bucket);
    expect('').toEqual(table);
  });
  it('should parse null input with default stage', function() {
    const parsed = parse(null, {defaultStage: 'out'});
    expect('out..').toEqual(parsed.tableId);
    const {stage, bucket, table} = parsed.parts;
    expect('out').toEqual(stage);
    expect('').toEqual(bucket);
    expect('').toEqual(table);
  });

  it('should parse table with missing bucket', function() {
    const parsed = parse('in..table', {defaultStage: 'out'});
    expect('in..table').toEqual(parsed.tableId);
    const {stage, bucket, table} = parsed.parts;
    expect('in').toEqual(stage);
    expect('').toEqual(bucket);
    expect('table').toEqual(table);
  });

  it('should parse bucket with missing table', function() {
    const parsed = parse('in.bucket.', {defaultStage: 'out'});
    expect('in.bucket.').toEqual(parsed.tableId);
    const {stage, bucket, table} = parsed.parts;
    expect('in').toEqual(stage);
    expect('bucket').toEqual(bucket);
    expect('').toEqual(table);
  });

  it('should parse whole tableId', function() {
    const parsed = parse('in.bucket.table');
    expect('in.bucket.table').toEqual(parsed.tableId);
    const {stage, bucket, table} = parsed.parts;
    expect('in').toEqual(stage);
    expect('bucket').toEqual(bucket);
    expect('table').toEqual(table);
  });

  it('should parse null input with default stage and bucket', function() {
    const parsed = parse(null, {defaultStage: 'out', defaultBucket: 'bucket'});
    expect('out.bucket.').toEqual(parsed.tableId);
    const {stage, bucket, table} = parsed.parts;
    expect('out').toEqual(stage);
    expect('bucket').toEqual(bucket);
    expect('').toEqual(table);
  });

  it('should parse input with default stage and bucket', function() {
    const parsed = parse('in.other.table', {defaultStage: 'out', defaultBucket: 'bucket'});
    expect('in.other.table').toEqual(parsed.tableId);
    const {stage, bucket, table} = parsed.parts;
    expect('in').toEqual(stage);
    expect('other').toEqual(bucket);
    expect('table').toEqual(table);
  });
  it('should parse input filling defaultbucket', function() {
    const parsed = parse('in..table', {defaultStage: 'out', defaultBucket: 'bucket'});
    expect('in.bucket.table').toEqual(parsed.tableId);
    const {stage, bucket, table} = parsed.parts;
    expect('in').toEqual(stage);
    expect('bucket').toEqual(bucket);
    expect('table').toEqual(table);
  });
});

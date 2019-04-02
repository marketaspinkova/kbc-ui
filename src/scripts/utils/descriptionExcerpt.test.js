import descriptionExcerpt from './descriptionExcerpt';

describe('descriptionExcerpt', () => {
  it('should return empty string for null', () => {
    expect(descriptionExcerpt(null)).toEqual('');
  });

  it('should return empty string for undefined', () => {
    expect(descriptionExcerpt(undefined)).toEqual('');
  });

  it('should return empty string for false', () => {
    expect(descriptionExcerpt(false)).toEqual('');
  });

  it('should return remove markdown - part 1', () => {
    const markdown = `
*Italic*
`;
    const expected = `Italic`;
    expect(descriptionExcerpt(markdown)).toEqual(expected);
  });

  it('should return remove markdown - part 2', () => {
    const markdown = `
> Blockquote
`;
    const expected = `Blockquote`;
    expect(descriptionExcerpt(markdown)).toEqual(expected);
  });

  it('should return remove markdown - part 3', () => {
    const markdown = `
# Markdown is a simple way to format text that looks great on any device.
`;
    const expected = `Markdown is a simple way to format text that looks great on any device.`;
    expect(descriptionExcerpt(markdown)).toEqual(expected);
  });

  it('should return remove markdown - part 4', () => {
    const markdown = `
## Markdown is a simple way to format text that looks great on any device. It doesn't do anything fancy.
`;
    const expected = `Markdown is a simple way to format text that looks great on any device. It...`;
    expect(descriptionExcerpt(markdown)).toEqual(expected);
  });

  it('should return remove complex markdown', () => {
    const markdown = `
### Data Dictionary

Field                      | Snowflake datatype | Description                                                                                                                                                                                                                                                                   | Examples
-------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------
`;
    const expected = `Data Dictionary Field | Snowflake datatype | Description | Examples...`;
    expect(descriptionExcerpt(markdown)).toEqual(expected);
  });
});

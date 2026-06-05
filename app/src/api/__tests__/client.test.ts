import {getImageUrl, SERVER_URL} from '../client';

describe('getImageUrl', () => {
  it('returns an empty string for empty input', () => {
    expect(getImageUrl('')).toBe('');
  });

  it('passes absolute URLs through unchanged', () => {
    expect(getImageUrl('http://cdn.example.com/a.jpg')).toBe(
      'http://cdn.example.com/a.jpg',
    );
    expect(getImageUrl('https://cdn.example.com/a.jpg')).toBe(
      'https://cdn.example.com/a.jpg',
    );
  });

  it('prefixes relative paths with the configured server URL', () => {
    expect(getImageUrl('/uploads/a.jpg')).toBe(`${SERVER_URL}/uploads/a.jpg`);
  });
});

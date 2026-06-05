import {SERVER_URL, API_BASE_URL} from '../env';

describe('env config', () => {
  it('falls back to an http(s) server URL when API_URL is unset', () => {
    expect(SERVER_URL).toMatch(/^https?:\/\//);
  });

  it('derives the API base from the server URL', () => {
    expect(API_BASE_URL).toBe(`${SERVER_URL}/api/v1`);
  });
});

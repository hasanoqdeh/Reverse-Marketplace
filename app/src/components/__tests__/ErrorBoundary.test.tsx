import React from 'react';
import {Text} from 'react-native';
import renderer, {act, ReactTestRenderer} from 'react-test-renderer';
import ErrorBoundary from '../ErrorBoundary';

function Boom(): JSX.Element {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders its children when there is no error', () => {
    let tree!: ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Text>hello world</Text>
        </ErrorBoundary>,
      );
    });
    expect(JSON.stringify(tree.toJSON())).toContain('hello world');
  });

  it('renders a recoverable fallback when a child throws', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let tree!: ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Something went wrong');
    expect(json).toContain('Try Again');
    spy.mockRestore();
  });
});

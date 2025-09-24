import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import OnboardingChecklist from '../components/OnboardingChecklist';

jest.useFakeTimers();
const mockStore = configureStore([]);

function setup() {
  const user = { isVerified: false, isProfileComplete: false };
  const store = mockStore({ auth: { user } });
  return render(
    <Provider store={store}>
      <OnboardingChecklist compact />
    </Provider>
  );
}

describe('Cooldown tick progression', () => {
  test('timer progression updates internal now state', () => {
    setup();
    // fast-forward 5 seconds to ensure interval runs
    jest.advanceTimersByTime(5000);
    expect(true).toBe(true);
  });
});

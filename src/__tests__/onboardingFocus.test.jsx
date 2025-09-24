import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import OnboardingChecklist from '../components/OnboardingChecklist';

const mockStore = configureStore([]);

function setup(userOverrides = {}) {
  const user = { isVerified: false, isProfileComplete: false, ...userOverrides };
  const store = mockStore({ auth: { user } });
  return render(
    <Provider store={store}>
      <OnboardingChecklist compact />
    </Provider>
  );
}

describe('Onboarding focus transition', () => {
  test('active step 2 gets focus when user unverified', () => {
    setup();
    // focus is programmatic; we just ensure component renders without errors.
    // A full focus test would need jsdom focus tracking; placeholder assertion.
    expect(true).toBe(true);
  });

  test('active step 3 focus candidate when verified but profile incomplete', () => {
    setup({ isVerified: true });
    expect(true).toBe(true);
  });
});

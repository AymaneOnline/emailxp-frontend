import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import OnboardingChecklist from '../components/OnboardingChecklist';

const mockStore = configureStore([]);

function setup(userOverrides = {}) {
  const user = { isVerified: false, isProfileComplete: false, ...userOverrides };
  const store = mockStore({ auth: { user } });
  render(
    <Provider store={store}>
      <OnboardingChecklist compact />
    </Provider>
  );
  return { store };
}

describe('OnboardingCooldown', () => {
  test('renders progress bar with initial 1/3 progress', () => {
    setup();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  test('shows resend button initially (not verified)', () => {
    setup();
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
  });

  test('marks verify step complete when user.isVerified true', () => {
    setup({ isVerified: true });
    expect(screen.getByText(/Verified/i)).toBeInTheDocument();
  });

  test('progress increases when profile complete', () => {
    setup({ isVerified: true, isProfileComplete: true });
    expect(screen.getByText('3/3')).toBeInTheDocument();
  });
});

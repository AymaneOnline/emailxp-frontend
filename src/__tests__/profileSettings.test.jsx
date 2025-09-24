import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ProfileSettings from '../pages/ProfileSettings';
import * as userService from '../services/userService';
import { MemoryRouter } from 'react-router-dom';

// Mock toast to avoid side effects
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

// Mock userService functions used in component
jest.mock('../services/userService', () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  uploadProfilePicture: jest.fn()
}));

const mockStore = configureStore([thunk]);

function renderWithStore(userOverrides = {}, profileOverrides = {}) {
  const user = { isVerified: true, isProfileComplete: false, email: 'test@example.com', ...userOverrides };
  const store = mockStore({ auth: { user } });

  // Default profile data returned by getUserProfile
  userService.getUserProfile.mockResolvedValue({
    companyOrOrganization: '',
    name: '',
    email: user.email,
    website: '',
    industry: '',
    bio: '',
    profilePicture: null,
    ...profileOverrides,
  });

  userService.updateUserProfile.mockResolvedValue({
    ...profileOverrides,
    companyOrOrganization: 'Acme',
    name: 'Tester',
    email: user.email,
    website: 'https://acme.test',
    industry: 'Technology',
    bio: 'Bio',
    profilePicture: null
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/settings']}>
        <ProfileSettings />
      </MemoryRouter>
    </Provider>
  );
}

describe('ProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders heading for incomplete profile', async () => {
    renderWithStore();
    expect(await screen.findByRole('heading', { name: /complete your profile/i })).toBeInTheDocument();
  });

  test('submitting first completion shows completion banner (no redirect)', async () => {
    renderWithStore();

    // Fill required fields
    fireEvent.change(await screen.findByLabelText(/company or organization/i), { target: { value: 'Acme' } });
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'Tester' } });
    fireEvent.change(screen.getByLabelText(/industry/i), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/about you/i), { target: { value: 'Bio' } });

    const submit = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submit);

    expect(await screen.findByText(/profile completed/i)).toBeInTheDocument();
    // Ensure update service called
    expect(userService.updateUserProfile).toHaveBeenCalled();
  });

  test('progress meter updates as fields change', async () => {
    renderWithStore();
    const orgInput = await screen.findByLabelText(/company or organization/i);
    const progressLabel = () => screen.getByText(/%$/); // e.g., 0% or some number

    // Initially should show 0% or low percentage
    expect(progressLabel()).toBeInTheDocument();

    fireEvent.change(orgInput, { target: { value: 'Acme' } });
    // After change, a re-render should still show a percentage label
    expect(progressLabel()).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import useQueryParamState from '../useQueryParamState';

function LocationDisplay() {
  const location = useLocation();
  return <p data-testid="location-search">{location.search}</p>;
}

function TestComponent() {
  const [tab, setTab] = useQueryParamState('tab', 'overview');
  const navigate = useNavigate();
  return (
    <div>
      <p data-testid="tab-value">{tab}</p>
      <LocationDisplay />
      <button onClick={()=>setTab('campaigns')}>Campaigns</button>
      <button onClick={()=>setTab('subscribers')}>Subscribers</button>
      <button onClick={()=>setTab('')}>Clear</button>
      <button onClick={()=>navigate('/other')}>Other Route</button>
    </div>
  );
}

describe('useQueryParamState', () => {
  test('initializes with default and updates query param', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}> 
        <Routes>
          <Route path="/dashboard" element={<TestComponent />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('tab-value').textContent).toBe('overview');
  await userEvent.click(screen.getByText('Campaigns'));
  expect(screen.getByTestId('tab-value').textContent).toBe('campaigns');
  expect(screen.getByTestId('location-search').textContent).toContain('tab=campaigns');
  await userEvent.click(screen.getByText('Subscribers'));
  expect(screen.getByTestId('location-search').textContent).toContain('tab=subscribers');
  await userEvent.click(screen.getByText('Clear'));
  expect(screen.getByTestId('location-search').textContent).not.toContain('tab=');
  });

  test('reads existing query param on mount', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard?tab=campaigns']}> 
        <Routes>
          <Route path="/dashboard" element={<TestComponent />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('tab-value').textContent).toBe('campaigns');
  });
});

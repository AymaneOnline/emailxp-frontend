import { render, screen } from '@testing-library/react';
import CampaignTimeSeriesChart from './CampaignTimeSeriesChart';

describe('CampaignTimeSeriesChart', () => {
  it('renders loading state', () => {
    render(<CampaignTimeSeriesChart isLoading={true} timeSeriesData={{}} />);
    expect(screen.getByText(/Loading chart data/i)).toBeInTheDocument();
  });
  it('renders error state', () => {
    render(<CampaignTimeSeriesChart isError={true} timeSeriesData={{}} />);
    expect(screen.getByText(/Error loading chart data/i)).toBeInTheDocument();
  });
  it('renders no data message', () => {
    render(<CampaignTimeSeriesChart isLoading={false} isError={false} timeSeriesData={{ labels: [], opens: [], clicks: [] }} />);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });
  it('renders chart with data (mocked)', () => {
    render(<CampaignTimeSeriesChart isLoading={false} isError={false} timeSeriesData={{ labels: ['2024-01-01'], opens: [5], clicks: [2] }} />);
    // From mock chart component we should see dataset labels
    expect(screen.getByText(/Opens/i)).toBeInTheDocument();
    expect(screen.getByText(/Clicks/i)).toBeInTheDocument();
  });
});


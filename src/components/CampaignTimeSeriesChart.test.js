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
    render(<CampaignTimeSeriesChart isLoading={false} isError={false} timeSeriesData={{ labels: [], emailsSent: [], opens: [], clicks: [] }} />);
    expect(screen.getByText(/No time-series data available/i)).toBeInTheDocument();
  });
  it('renders chart with data', () => {
    render(<CampaignTimeSeriesChart isLoading={false} isError={false} timeSeriesData={{ labels: ['2024-01-01'], emailsSent: [10], opens: [5], clicks: [2] }} />);
    expect(screen.getByText(/Sent/i)).toBeInTheDocument();
    expect(screen.getByText(/Opens/i)).toBeInTheDocument();
    expect(screen.getByText(/Clicks/i)).toBeInTheDocument();
  });
});


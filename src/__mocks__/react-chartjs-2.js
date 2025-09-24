// Lightweight mock for react-chartjs-2 Line component used in tests
import React from 'react';
export const Line = ({ data }) => (
  <div data-testid="chart-mock">
    {(data?.datasets || []).map(ds => <span key={ds.label}>{ds.label}</span>)}
  </div>
);
export default { Line };

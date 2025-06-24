// emailxp/frontend/src/components/CampaignTimeSeriesChart.js

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components once in the component where they are used
// or in a central registration file if preferred for larger apps.
// For now, registering directly in the component is fine.
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function CampaignTimeSeriesChart({ timeSeriesData, timeSeriesPeriod, isLoading, isError }) {

    // Function to format data for Chart.js
    const getChartData = () => {
        const labels = timeSeriesData.map(item => item.date);
        const opensData = timeSeriesData.map(item => item.opens);
        const clicksData = timeSeriesData.map(item => item.clicks);

        return {
            labels,
            datasets: [
                {
                    label: 'Opens',
                    data: opensData,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1,
                },
                {
                    label: 'Clicks',
                    data: clicksData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                },
            ],
        };
    };

    // Chart options (can be customized further)
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `${timeSeriesPeriod === 'daily' ? 'Daily' : 'Weekly'} Engagement`,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
                stacked: false,
            },
            y: {
                title: {
                    display: true,
                    text: 'Count',
                },
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        if (value % 1 === 0) {
                            return value;
                        }
                    }
                },
                stacked: false,
            },
        },
    };

    // Handle loading/error states within the chart component if passed
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading chart data...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="error-container">
                <p>Error loading chart data.</p>
            </div>
        );
    }

    return (
        <div className="chart-container" style={{ minHeight: '300px' }}> {/* Added minHeight for better initial rendering */}
            {timeSeriesData.length > 0 ? (
                <Bar data={getChartData()} options={chartOptions} />
            ) : (
                <p className="no-data-message">No time-series data available for this campaign yet.</p>
            )}
        </div>
    );
}

export default CampaignTimeSeriesChart;
import React, { useState, useEffect } from 'react';
import './HistogramByWeek.css';

// Utility function to format date for display
const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
};

// Function to generate the current week's date range (Monday to Sunday)
const generateDateRange = (currentDate) => {
    const startOfWeek = new Date(currentDate);
    const currentDay = startOfWeek.getDay();
    
    startOfWeek.setDate(currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
        const nextDate = new Date(startOfWeek);
        nextDate.setDate(startOfWeek.getDate() + i);
        days.push({
            date: nextDate.toISOString().split('T')[0],
            label: formatDate(nextDate),
        });
    }
    return days;
};

const HistogramByWeek = () => {
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Evaluating/get_timeManager_by_week.php`;
    
    const [timeManagerData, setTimeManagerData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const dateRange = generateDateRange(currentDate);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Date': currentDate.toISOString().split('T')[0],
                    },
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTimeManagerData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [currentDate]);

    // Calculate total time spent for each day
    const calculateTotalTimePerDay = () => {
        const totalTimePerDay = {};

        timeManagerData.forEach(activity => {
            const date = activity.startTime.split(' ')[0]; // Extract date from start time
            const durationParts = activity.duration.split(':');
            const durationInMinutes = parseInt(durationParts[0], 10) * 60 + parseInt(durationParts[1], 10); // Convert to minutes

            if (!totalTimePerDay[date]) {
                totalTimePerDay[date] = 0;
            }
            totalTimePerDay[date] += durationInMinutes; // Sum up durations for each date
        });

        return totalTimePerDay;
    };

    const totalTimePerDay = calculateTotalTimePerDay();

    return (
        <div className="histogram-container">
            <h2>Time Spent by Day</h2>
            <div className="histogram">
                {dateRange.map(day => (
                    <div key={day.date} className="histogram-bar">
                        <div className="histogram-label">{day.label}</div>
                        <div
                            className="histogram-value"
                            style={{
                                height: `${(totalTimePerDay[day.date] || 0) / 60}px`, // Scale the height based on total minutes
                                backgroundColor: '#4caf50',
                            }}
                        >
                            {totalTimePerDay[day.date] ? `${(totalTimePerDay[day.date] / 60).toFixed(2)} hrs` : '0 hrs'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistogramByWeek;

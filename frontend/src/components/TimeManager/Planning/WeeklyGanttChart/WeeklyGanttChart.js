import React, { useState } from 'react';
import './WeeklyGanttChart.css';

// Utility function to format date for display
const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
};

// Function to generate 10 days starting from today
const generateDateRange = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 10; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        days.push({
            date: nextDate.toISOString().split('T')[0],
            label: formatDate(nextDate),
        });
    }
    return days;
};

// Convert time (HH:mm) to position on the X axis (hours)
const timeToPosition = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
};

// Tooltip component for activity details with dynamic position
const CustomTooltip = ({ activity, startTime, endTime, duration, position }) => (
    <div className="custom-tooltip" style={{ top: position.top, left: position.left }}>
        <h4>Activity Details</h4>
        <p><strong>Activity:</strong> {activity}</p>
        <p><strong>Start Time:</strong> {startTime}</p>
        <p><strong>End Time:</strong> {endTime}</p>
        <p><strong>Duration:</strong> {duration} hours</p>
    </div>
);

const WeeklyGanttChart = ({ engagements }) => {
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const dateRange = generateDateRange();

    // Handle showing tooltip on hover
    const handleMouseEnter = (engagement, e) => {
        setTooltipData(engagement);
        const { clientX, clientY } = e; // Get mouse coordinates
        setTooltipPosition({ top: clientY + 10, left: clientX + 10 });
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
    };

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        setTooltipPosition({ top: clientY + 10, left: clientX + 10 });
    };

    return (
        <div className="gantt-chart-container">
            <div className="gantt-time-axis">
                {/* Empty space for row labels */}
                <div className="gantt-row-label"></div>
                {/* Time axis (every 6 hours) */}
                <div className="gantt-time-labels">
                    {[0, 6, 12, 18, 24].map((hour, index) => (
                        <div 
                        key={index} 
                        className={
                            hour === 0 || hour === 6 
                            ? "gantt-hour-label-left" 
                            : hour === 12 
                            ? "gantt-hour-label-center" 
                            : "gantt-hour-label-right"
                        }
                        >
                        {hour}:00
                        </div>
                    ))}
                </div>

            </div>

            {/* Create rows for each day */}
            {dateRange.map((day) => (
                <div key={day.date} className="gantt-row">
                    {/* Label for the day (Y axis) */}
                    <div className="gantt-row-label">
                        {day.label}
                    </div>
                    {/* Unified background and activity bars */}
                    <div className="gantt-row-activities">
                        {engagements
                            .filter(engagement => engagement.date === day.date)
                            .map((engagement, index) => {
                                const startPosition = timeToPosition(engagement.start_time);
                                const endPosition = timeToPosition(engagement.end_time);
                                const duration = endPosition - startPosition;

                                return (
                                    <div
                                        key={index}
                                        className="gantt-bar"
                                        style={{
                                            left: `${(startPosition / 24) * 100}%`,
                                            width: `${(duration / 24) * 100}%`,
                                        }}
                                        onMouseEnter={(e) => handleMouseEnter(engagement, e)}
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {engagement.name}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            ))}

            {/* Display tooltip near the activity being hovered */}
            {tooltipData && (
                <CustomTooltip
                    activity={tooltipData.name}
                    startTime={tooltipData.start_time}
                    endTime={tooltipData.end_time}
                    duration={(timeToPosition(tooltipData.end_time) - timeToPosition(tooltipData.start_time)).toFixed(2)}
                    position={tooltipPosition}
                />
            )}
        </div>
    );
};

export default WeeklyGanttChart;

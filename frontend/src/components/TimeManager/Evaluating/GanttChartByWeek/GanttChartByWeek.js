import React, { useState, useEffect } from 'react';
import './GanttChartByWeek.css';

// Utility function to format date for display
const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
};

// Utility function to format time (HH:mm)
const formatTime = (time) => {
    const [datePart, timePart] = time.split(' '); // Split date and time
    return timePart; // Return only HH:mm part
};

// Function to generate the current week's date range (Monday to Sunday)
const generateDateRange = (currentDate) => {
    const startOfWeek = new Date(currentDate);
    
    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDay = startOfWeek.getDay();

    // Adjust the start of the week
    // If today is Sunday (0), go back 6 days to get to the last Monday
    // If today is any other day, just go back to the previous Monday
    startOfWeek.setDate(currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Adjust to Monday
    
    const days = [];
    for (let i = 0; i < 7; i++) { // 7 days for the week
        const nextDate = new Date(startOfWeek);
        nextDate.setDate(startOfWeek.getDate() + i);
        days.push({
            date: nextDate.toISOString().split('T')[0],
            label: formatDate(nextDate),
        });
    }
    return days;
};

// Convert time (HH:mm) to position on the X axis (hours)
const timeToPosition = (time) => {
    if (!time) return 0; // Handle undefined or empty time
    const [datePart, timePart] = time.split(' '); // Split date and time
    const [hours, minutes] = timePart.split(':').map(Number);
    return hours + minutes / 60; // Convert to hours
};

// Tooltip component for activity details with dynamic position
const CustomTooltip = ({ activity, position }) => {
    // Format the start and end times to HH:mm
    const formattedStartTime = formatTime(activity.startTime);
    const formattedEndTime = formatTime(activity.endTime);
    const duration = (timeToPosition(activity.endTime) - timeToPosition(activity.startTime)).toFixed(2);

    return (
        <div className="custom-tooltip" style={{ top: position.top, left: position.left }}>
            <h4>Activity Details</h4>
            <p><strong>Start Time:</strong> {formattedStartTime}</p>
            <p><strong>End Time:</strong> {formattedEndTime}</p>
            <p><strong>Duration:</strong> {duration} hours</p>
        </div>
    );
};


const GanttChartByWeek = () => {
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Evaluating/get_timeManager_by_week.php`;
    
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [timeManagerData, setTimeManagerData] = useState([]); // State to hold fetched data
    const [currentDate, setCurrentDate] = useState(new Date()); // State for the current date
    const dateRange = generateDateRange(currentDate); // Generate date range based on currentDate
    const startDate = dateRange[0].date; // Monday
    const endDate = dateRange[dateRange.length - 1].date; // Sunday
    const formattedStartDate = formatDate(new Date(startDate));
    const formattedEndDate = formatDate(new Date(endDate));

    useEffect(() => {
        // Fetch data from the API
        const fetchData = async () => {
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Date': currentDate.toISOString().split('T')[0], // Send current date in X-Date header
                    },
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTimeManagerData(data); // Update state with fetched data
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(); // Call the fetch function
    }, [currentDate]); // Fetch data when currentDate changes

    // Handle showing tooltip on hover
    const handleMouseEnter = (activity, e) => {
        setTooltipData(activity);
        const { clientX, clientY } = e; // Get mouse coordinates
        setTooltipPosition({ top: clientY + 10, left: clientX + 10 });
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
    };

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        setTooltipPosition({ top: clientY - 200, left: clientX+500});
    };

    // Functions to navigate weeks
    const goToPreviousWeek = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() - 7);
            return newDate;
        });
    };

    const goToNextWeek = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() + 7);
            return newDate;
        });
    };

        // Calculate total duration and average
        const calculateDurations = () => {
            let totalDurationInMinutes = 0; // Total duration in minutes

            // Iterate over each activity and sum the duration directly
            timeManagerData.forEach(activity => {
                const durationParts = activity.duration.split(':'); // Split the duration into parts
                const hours = parseInt(durationParts[0], 10); // Get the hours part
                const minutes = parseInt(durationParts[1], 10); // Get the minutes part
                const seconds = parseInt(durationParts[2], 10); // Get the seconds part

                // Convert the entire duration to minutes
                const durationInMinutes = hours * 60 + minutes + Math.floor(seconds / 60); // Total minutes
                totalDurationInMinutes += durationInMinutes; // Add to total
            });

            const dailyAverageInMinutes = Math.floor(totalDurationInMinutes / 7); // Calculate daily average in minutes

            // Function to convert total minutes to hh:mm format
            const convertToHHMM = (totalMinutes) => {
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return `${hours}:${String(minutes).padStart(2, '0')}`; // Format to hh:mm
            };

            return {
                totalDuration: convertToHHMM(totalDurationInMinutes), // Format total duration
                dailyAverage: convertToHHMM(dailyAverageInMinutes) // Format daily average
            };
        };






    const { totalDuration, dailyAverage } = calculateDurations();

    return (
        <div className="gantt-chart-container">
            <div className="gantt-week-navigation">
                <p>Previous Week</p>
                <button onClick={goToPreviousWeek}>{"<"}</button>
                <div className="week-range">
                    FROM {formattedStartDate} 
                    <br></br>
                    TO {formattedEndDate}
                </div>
                <button onClick={goToNextWeek}>{">"}</button>
                <p>Next Week</p>
            </div>
            <div className="time-summary">
                <div className='time-details'>
                    <p><strong>Total Time Spent:</strong> {totalDuration}</p>
                </div>
                <div className='time-details'>
                    <p><strong>Daily Average:</strong> {dailyAverage}</p>
                </div>
            </div>
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
                    {timeManagerData
                        .filter(activity => {
                            const isSameDate = activity.startTime.split(' ')[0] === day.date; // Check the date
                            
                            // Debugging output
                            // console.log(`Checking activity: ${activity.name}`);
                            // console.log(`Activity Date: ${activity.startTime.split(' ')[0]}, Target Date: ${day.date}`);
                            // console.log(`Condition met: ${isSameDate}`);
                            
                            return isSameDate; // Return the condition result
                        })
                        .map((activity, index) => {
                            const startPosition = timeToPosition(activity.startTime);
                            const endPosition = timeToPosition(activity.endTime);
                            const duration = (endPosition - startPosition).toFixed(2); // Ensure duration is formatted

                            return (
                                <div
                                    key={index}
                                    className="gantt-bar"
                                    style={{
                                        left: `${(startPosition / 24) * 100}%`,
                                        width: `${(duration / 24) * 100}%`,
                                    }}
                                    onMouseEnter={(e) => handleMouseEnter(activity, e)}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {activity.name} {/* Optional: Display activity name */}
                                </div>
                            );
                        })}
                </div>

                </div>
            ))}

            {/* Tooltip for activities */}
            {tooltipData && (
                <CustomTooltip
                    activity={tooltipData}
                    startTime={tooltipData.startTime}
                    endTime={tooltipData.endTime}
                    duration={(timeToPosition(tooltipData.endTime) - timeToPosition(tooltipData.startTime)).toFixed(2)}
                    position={tooltipPosition}
                />
            )}
        </div>
    );
};

export default GanttChartByWeek;

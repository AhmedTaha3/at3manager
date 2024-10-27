import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './HistorgamByWeekByActivity.css'; // Import the CSS file

const HistogramByWeekByActivity = () => {
    const [activityData, setActivityData] = useState([]);
    const [totalDuration, setTotalDuration] = useState('00:00');
    const [dailyAverage, setDailyAverage] = useState('00:00');
    const [currentWeekStartDate, setCurrentWeekStartDate] = useState(new Date());

    const getMonday = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const formatDate = (date) => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[date.getDay()];
        return `${dayName}`;
    };

    const formatDate2 = (date) => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[date.getDay()];
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${dayName}, ${month}/${day}/${year}`;
    };

    const fetchData = async (date) => {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
        const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Evaluating/histogram_by_week_by_activity.php`; // Updated endpoint

        const formattedDate = date.toISOString().split('T')[0];

        try {
            const response = await axios.get(apiUrl, {
                headers: { 'X-Date': formattedDate }
            });
            const { activities } = response.data;
            setActivityData(activities);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const calculateDurations = () => {
        let totalDurationInMinutes = 0;

        activityData.forEach(activity => {
            const durationParts = activity.total_duration.split(':');
            const hours = parseInt(durationParts[0], 10);
            const minutes = parseInt(durationParts[1], 10);
            const seconds = parseInt(durationParts[2], 10);
            const durationInMinutes = hours * 60 + minutes + Math.floor(seconds / 60);
            totalDurationInMinutes += durationInMinutes;
        });

        const dailyAverageInMinutes = Math.floor(totalDurationInMinutes / 7);

        const convertToHHMM = (totalMinutes) => {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}:${String(minutes).padStart(2, '0')}`;
        };

        setTotalDuration(convertToHHMM(totalDurationInMinutes));
        setDailyAverage(convertToHHMM(dailyAverageInMinutes));
    };

    useEffect(() => {
        const mondayOfCurrentWeek = getMonday(new Date());
        setCurrentWeekStartDate(mondayOfCurrentWeek);
        fetchData(mondayOfCurrentWeek);
    }, []);

    useEffect(() => {
        calculateDurations();
    }, [activityData]);

    const goToPreviousWeek = () => {
        const previousWeekStartDate = new Date(currentWeekStartDate);
        previousWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
        setCurrentWeekStartDate(previousWeekStartDate);
        fetchData(previousWeekStartDate);
    };

    const goToNextWeek = () => {
        const nextWeekStartDate = new Date(currentWeekStartDate);
        nextWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);
        setCurrentWeekStartDate(nextWeekStartDate);
        fetchData(nextWeekStartDate);
    };

    const chartData = activityData.map(activity => ({
        activity: activity.activity,
        durationInHours: (() => {
            const [hours, minutes] = activity.total_duration.split(':').map(Number);
            return hours + minutes / 60;
        })()
    }));

    return (
        <div className='gantt-chart-container'>
            <div className="gantt-week-navigation">
                <p>Previous Week</p>
                <button onClick={goToPreviousWeek}>{"<"}</button>
                <div className="week-range">
                    FROM {formatDate2(currentWeekStartDate)}
                    <br />
                    TO {formatDate2(new Date(currentWeekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000))}
                </div>
                <button onClick={goToNextWeek}>{">"}</button>
                <p>Next Week</p>
            </div>
            <div className="time-summary">
                <div className="time-details">
                    <p><strong>Total Time Spent:</strong> {totalDuration}</p>
                </div>
                <div className="time-details">
                    <p><strong>Daily Average:</strong> {dailyAverage}</p>
                </div>
            </div>
            <div className="bar-chart-container">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="activity" tick={{ fontSize: 10 }} interval={0} />
                        <YAxis tick={{ fontSize: 14 }} />
                        <Tooltip formatter={(value) => `${value.toFixed(2)} hours`} />
                        <Bar dataKey="durationInHours" fill="#b93131" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistogramByWeekByActivity;

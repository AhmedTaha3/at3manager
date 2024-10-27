import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './HistogramByMonthByActivity.css'; // Import the CSS file

const HistogramByMonthByActivity = () => {
    const [activityData, setActivityData] = useState([]);
    const [totalDuration, setTotalDuration] = useState('00:00');
    const [dailyAverage, setDailyAverage] = useState('00:00');
    const [currentMonthStartDate, setCurrentMonthStartDate] = useState(new Date());

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 5);
    };

    const formatDate = (date) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${months[date.getMonth()]}`;
    };

    const fetchData = async (date) => {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
        const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Evaluating/histogram_by_month_by_activity.php`;
        console.log('fetchData date:', date);
        const formattedDate = date.toISOString().split('T')[0];
        console.log('formattedDate:', formattedDate);
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

        const dailyAverageInMinutes = Math.floor(totalDurationInMinutes / activityData.length || 1);

        const convertToHHMM = (totalMinutes) => {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}:${String(minutes).padStart(2, '0')}`;
        };

        setTotalDuration(convertToHHMM(totalDurationInMinutes));
        setDailyAverage(convertToHHMM(dailyAverageInMinutes));
    };

    useEffect(() => {
        const firstDayOfCurrentMonth = getFirstDayOfMonth(new Date());
        setCurrentMonthStartDate(firstDayOfCurrentMonth);
        fetchData(firstDayOfCurrentMonth);
    }, []);

    useEffect(() => {
        calculateDurations();
    }, [activityData]);

    const goToPreviousMonth = () => {
        const previousMonthStartDate = new Date(currentMonthStartDate);
        previousMonthStartDate.setMonth(currentMonthStartDate.getMonth() - 1);
        setCurrentMonthStartDate(previousMonthStartDate);
        fetchData(previousMonthStartDate);
    };

    const goToNextMonth = () => {
        const nextMonthStartDate = new Date(currentMonthStartDate);
        nextMonthStartDate.setMonth(currentMonthStartDate.getMonth() + 1);
        setCurrentMonthStartDate(nextMonthStartDate);
        fetchData(nextMonthStartDate);
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
                <p>Previous Month</p>
                <button onClick={goToPreviousMonth}>{"<"}</button>
                <div className="week-range">
                    {formatDate(currentMonthStartDate)}
                </div>
                <button onClick={goToNextMonth}>{">"}</button>
                <p>Next Month</p>
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
                        <XAxis dataKey="activity" tick={{ fontSize: 14 }} />
                        <YAxis tick={{ fontSize: 14 }} />
                        <Tooltip formatter={(value) => `${value.toFixed(2)} hours`} />
                        <Bar dataKey="durationInHours" fill="#b93131" className="bar" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistogramByMonthByActivity;

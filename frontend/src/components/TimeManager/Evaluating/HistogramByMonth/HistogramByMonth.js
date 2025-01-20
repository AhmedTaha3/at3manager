import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './HistogramByMonth.css'; // Import the CSS file

const HistogramByMonth = () => {
    const [timeManagerData, setTimeManagerData] = useState([]);
    const [totalDuration, setTotalDuration] = useState('00:00');
    const [dailyAverage, setDailyAverage] = useState('00:00');
    const [currentMonthStartDate, setCurrentMonthStartDate] = useState(new Date());

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 5);
    };

    const getLastDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${month}`;
    };
    
    const formatDate2 = (date) => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[date.getDay()];
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${dayName}, ${month}/${day}/${year}`;
        // return `${dayName}`;
    };

    const fetchData = async (date) => {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
        const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Evaluating/histogram_by_month.php`;
        
        // Debug: Afficher la date passée à fetchData
        
        
        const formattedDate = date.toISOString().split('T')[0];
        
        
        try {
            const response = await axios.get(apiUrl, {
                headers: { 'X-Date': formattedDate }
            });
            const { days } = response.data;
            setTimeManagerData(days);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const calculateDurations = () => {
        let totalDurationInMinutes = 0;

        timeManagerData.forEach(day => {
            const durationParts = day.total_duration.split(':');
            const hours = parseInt(durationParts[0], 10);
            const minutes = parseInt(durationParts[1], 10);
            const seconds = parseInt(durationParts[2], 10);
            const durationInMinutes = hours * 60 + minutes + Math.floor(seconds / 60);
            totalDurationInMinutes += durationInMinutes;
        });

        const dailyAverageInMinutes = Math.floor(totalDurationInMinutes / timeManagerData.length);

        const convertToHHMM = (totalMinutes) => {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}:${String(minutes).padStart(2, '0')}`;
        };

        setTotalDuration(convertToHHMM(totalDurationInMinutes));
        setDailyAverage(convertToHHMM(dailyAverageInMinutes));
    };
    const convertToHHMM = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}:${String(minutes).padStart(2, '0')}`; // Format to hh:mm
    };
    
    useEffect(() => {
        const firstDayOfCurrentMonth = getFirstDayOfMonth(new Date());
        
        // Debug: Afficher la première date du mois actuel
        console.log('firstDayOfCurrentMonth:', firstDayOfCurrentMonth);
        
        setCurrentMonthStartDate(firstDayOfCurrentMonth);
        fetchData(firstDayOfCurrentMonth);
    }, []);

    useEffect(() => {
        calculateDurations();
    }, [timeManagerData]);

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

    const chartData = timeManagerData.map(day => ({
        date: formatDate2(new Date(day.date)),
        TimeSpent: (() => {
            const [hours, minutes] = day.total_duration.split(':').map(Number);
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
                        <XAxis dataKey="date" tick={{ fontSize: 14 }}  />
                        <YAxis tick={{ fontSize: 14 }} />
                        <Tooltip formatter={(value) => `${convertToHHMM(value*60)}`} />
                        <Bar dataKey="TimeSpent" fill="#b93131" className="bar" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistogramByMonth;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './GanttChart.css';

const GanttChart = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [filters, setFilters] = useState({ categories: [], date: new Date().toISOString().split('T')[0] });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/configuration`;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/get_categories.php`);
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleDateChange = (e) => {
    setFilters((prevFilters) => ({ ...prevFilters, date: e.target.value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use filters.date as a query parameter to retrieve data by date
        const response = await axios.get(
          `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/get_timemanager_by_date.php?date=${filters.date}`
        );
        setData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const filteredData = data.filter((item) => {
    const itemDate = new Date(item.startTime).toISOString().split('T')[0];
    const isDateMatch = itemDate === filters.date;
    const isCategoryMatch = selectedCategory.length === 0 || selectedCategory.includes(item.category);

    return isDateMatch && isCategoryMatch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const convertTimeToHours = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(' ')[1].split(':').map(Number);
    return hours + minutes / 60 + seconds / 3600;
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const transformData = (inputData) => {
    return inputData.map((item) => {
      const startHour = convertTimeToHours(item.startTime);
      const endHour = convertTimeToHours(item.endTime);

      // Calculate the duration, taking into account crossing midnight
      const duration = endHour >= startHour ? endHour - startHour : endHour - startHour + 24;

      return {
        activity: item.activity,
        startHour,
        duration,
        startTime: item.startTime.split(' ')[1], // Extract time part only
        endTime: item.endTime.split(' ')[1], // Extract time part only
      };
    });
  };

  const chartData = transformData(filteredData);

  const adjustedData = chartData.map((item) => ({
    activity: item.activity,
    start: item.startHour,
    duration: item.duration,
    startTime: item.startTime,
    endTime: item.endTime,
  }));

  const totalDuration = filteredData.reduce((acc, item) => {
    const startHour = convertTimeToHours(item.startTime);
    const endHour = convertTimeToHours(item.endTime);

    // Calculate the duration, considering the midnight crossing
    const duration = endHour >= startHour ? endHour - startHour : endHour - startHour + 24;

    return acc + duration;
  }, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { activity, startTime, endTime, duration } = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p>
            <strong>Activity:</strong> {activity}
          </p>
          <p>
            <strong>Start Time:</strong> {startTime}
          </p>
          <p>
            <strong>End Time:</strong> {endTime}
          </p>
          <p>
            <strong>Duration:</strong> {formatDuration(duration)}
          </p>
        </div>
      );
    }
    return null;
  };

  const MultiSelectCheckbox = ({ options, selectedOptions, onChange }) => {
    const handleCheckboxChange = (event) => {
      const { value, checked } = event.target;
      const updatedSelectedOptions = checked
        ? [...selectedOptions, value]
        : selectedOptions.filter((option) => option !== value);
      onChange(updatedSelectedOptions);
    };

    return (
      <div className="custom-multi-select">
        {options.map((option) => (
          <label key={option} className="checkbox-label">
            <input
              type="checkbox"
              value={option}
              checked={selectedOptions.includes(option)}
              onChange={handleCheckboxChange}
            />
            {option}
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="gantt-chart-container">
      <h1 className="add-time-manager-title">Daily Activities</h1>
      <div className='history-button'>
        <button className="remove-category-button" type="button"  onClick={() => navigate('/timemanager/database')}>History</button>
      </div>
      <div className="gantt-chart-header">
        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-select">
            <MultiSelectCheckbox
              options={categories.map((category) => category.name)}
              selectedOptions={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>
        <input type="date" className="filter-date" value={filters.date} onChange={handleDateChange} />
        {/* Informative Data */}
        <div className="info-data">
          <p>Date: {filters.date}</p>
          <p>Total Time Spent: {formatDuration(totalDuration)}</p>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-chart">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            layout="vertical"
            data={adjustedData}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            onClick={(e) => setTooltipData(e.activePayload ? e.activePayload[0].payload : null)}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 24]} tickFormatter={(tick) => `${tick}:00`} />
            <YAxis type="category" dataKey="activity" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="start" stackId="a" fill="transparent" />
            <Bar dataKey="duration" stackId="a" fill="#b93131" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Display additional information on click */}
      {tooltipData && (
        <div className="tooltip-info">
          <p>
            <strong>Activity:</strong> {tooltipData.activity}
          </p>
          <p>
            <strong>Start Time:</strong> {tooltipData.startTime}
          </p>
          <p>
            <strong>End Time:</strong> {tooltipData.endTime}
          </p>
          <p>
            <strong>Duration:</strong> {formatDuration(tooltipData.duration)}
          </p>
        </div>
      )}
    </div>
  );
};

export default GanttChart;

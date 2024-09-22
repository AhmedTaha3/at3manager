import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Histogram = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [filters, setFilters] = useState({ categories: [], date: new Date().toISOString().split('T')[0] });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/get_timemanager_from_a_date.php`;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/at3manager/backend/routes/TimeManager/configuration/get_categories.php`);
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
        const url = filters.date
          ? `${apiUrl}?date=${filters.date}`
          : apiUrl;

        const response = await axios.get(url);
        if (Array.isArray(response.data)) {
          setData(response.data);
          console.log("response: ",response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setData([]);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const aggregateData = (inputData) => {
    if (!Array.isArray(inputData)) {
      console.error('Expected inputData to be an array, but got:', inputData);
      return [];
    }

    const groupedData = inputData.reduce((acc, item) => {
      const date = new Date(item.startTime).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, categories: {}, totalDuration: 0 };
      }
      const duration = convertTimeToHours(item.endTime) - convertTimeToHours(item.startTime);

      acc[date].categories[item.category] = (acc[date].categories[item.category] || 0) + duration;
      acc[date].totalDuration += duration;

      return acc;
    }, {});

    return Object.values(groupedData);
  };

  const filteredData = aggregateData(data).filter((item) => {
    const isCategoryMatch =
      selectedCategory.length === 0 || Object.keys(item.categories).some((cat) => selectedCategory.includes(cat));
    return isCategoryMatch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dayData = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p><strong>Date:</strong> {dayData.date}</p>
          {Object.entries(dayData.categories).map(([category, time]) => (
            <p key={category}><strong>{category}:</strong> {formatDuration(time)}</p>
          ))}
          <p><strong>Total Time Spent:</strong> {formatDuration(dayData.totalDuration)}</p>
        </div>
      );
    }
    return null;
  };

  const convertTimeToHours = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(' ')[1].split(':').map(Number);
    return hours + minutes / 60 + seconds / 3600;
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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
      <h1 className="add-time-manager-title">Weekly Time Spent Histogram</h1>
      <div className='history-button'>
        <button className="remove-category-button" type="button" onClick={() => navigate('/timemanager/database')}>History</button>
      </div>
      <div className="gantt-chart-header">
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
        <div className="info-data">
          <p>Date: {filters.date}</p>
        </div>
      </div>

      {/* Histogram */}
      <p>DATA : {filteredData}</p>
      <div className="gantt-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalDuration" fill="#b93131" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Histogram;
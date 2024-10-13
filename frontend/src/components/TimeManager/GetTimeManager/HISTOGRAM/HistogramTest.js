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
  const [filters, setFilters] = useState({ date: new Date().toISOString().split('T')[0] });
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
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDateChange = (e) => {
    setFilters((prevFilters) => ({ ...prevFilters, date: e.target.value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = filters.date ? `${apiUrl}?date=${filters.date}` : apiUrl;
        const response = await axios.get(url);
        if (response.data && typeof response.data === 'object') {
          setData(transformData(response.data)); // Transform API response
        } else {
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

  // Transform the data from object format to array format suitable for BarChart
  const transformData = (inputData) => {
    return Object.keys(inputData).map((date) => ({
      date,
      ...inputData[date],
    }));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dayData = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p><strong>Date:</strong> {dayData.date}</p>
          {Object.entries(dayData).map(([key, value]) => (
            key !== "date" && (
              <p key={key}><strong>{key}:</strong> {value}</p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="gantt-chart-container">
      <h1 className="add-time-manager-title">Weekly Time Spent Histogram</h1>
      <div className="history-button">
        <button className="remove-category-button" type="button" onClick={() => navigate('/timemanager/database')}>History</button>
      </div>
      <div className="gantt-chart-header">
        <input type="date" className="filter-date" value={filters.date} onChange={handleDateChange} />
        <div className="info-data">
          <p>Date: {filters.date}</p>
        </div>
      </div>

      <div className="gantt-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="TOTAL" fill="#b93131" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
    </div>
    
  );
};

export default Histogram;

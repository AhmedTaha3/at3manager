import React, { useEffect, useState } from 'react';
import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function GetTimeManager() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/at3manager/backend/routes/get_timemanager.php`);
        setData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Time Manager Data</h1>
      <table>
        <thead>
          <tr>
            <th>Activity</th>
            <th>Category</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
            <th>Day</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.activity}</td>
              <td>{item.category}</td>
              <td>{item.startTime}</td>
              <td>{item.endTime}</td>
              <td>{item.duration}</td>
              <td>{item.day}</td>
              <td>{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GetTimeManager;

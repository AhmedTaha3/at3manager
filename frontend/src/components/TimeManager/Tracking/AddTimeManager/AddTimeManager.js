import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./AddTimeManager.css";

function AddTimeManager() {
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const trackingUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Tracking/time`;
  const taskUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Tracking/get_tasks_by_date.php`;

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [day, setDay] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [taskIsSelected, setTaskIsSelected] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('');
  const [workedTime, setWorkedTime] = useState('');

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(taskUrl);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; 
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = dayNames[today.getUTCDay()];

    setDate(currentDate);
    setDay(currentDay);

    const storedId = localStorage.getItem('timeManagerId');
    if (storedId) {
      setIsStarted(true);
      setStartTime(localStorage.getItem('startTime'));
      setSelectedTask(localStorage.getItem('task_id'));
      setWorkedTime(localStorage.getItem('workedTime') || '00:00:00');
    }
  }, []);

  useEffect(() => {
    let timer;
    if (isStarted && startTime) {
      timer = setInterval(() => {
        const now = new Date();
        const duration = calculateDuration(startTime, now.toISOString());
        setElapsedTime(duration);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isStarted, startTime]);

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = (endTime - startTime) / 1000;

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = Math.floor(diff % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateAccomplishmentRate = (workedTime, estimatedTime) => {
    const [workedHours, workedMinutes, workedSeconds] = workedTime.split(':').map(Number);
    const [estimatedHours, estimatedMinutes, estimatedSeconds] = estimatedTime.split(':').map(Number);

    const workedTotalSeconds = workedHours * 3600 + workedMinutes * 60 + workedSeconds;
    const estimatedTotalSeconds = estimatedHours * 3600 + estimatedMinutes * 60 + estimatedSeconds;
    const rate = (workedTotalSeconds / estimatedTotalSeconds) * 100;
    return  rate.toFixed(0) + "% ";
  };

  const formatDateForDatabase = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleStart = async () => {
    if (!selectedTask) {
      setError('Please select a task.');
      return;
    }

    const now = new Date();
    const start = formatDateForDatabase(now);
    setStartTime(start);
    // setSelectedTask(null);
    try {
      const response = await axios.post(`${trackingUrl}/add_timemanager.php`, {
        task_id: selectedTask,
        startTime: start,
        endTime: start,
        day,
        date
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setError('');
        setIsStarted(true);
        setTaskIsSelected(false);
        localStorage.setItem('timeManagerId', response.data.id);
        localStorage.setItem('startTime', start);
        localStorage.setItem('task_id', selectedTask);
        localStorage.setItem('workedTime', workedTime);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('An error occurred while starting the activity.');
    }
  };

  const handleEnd = async () => {
    if (!startTime) {
      setError('Start time is missing. Please click "Start" first.');
      return;
    }

    const now = new Date();
    const end = formatDateForDatabase(now);
    setEndTime(end);

    const duration = calculateDuration(startTime, end);
    const id = localStorage.getItem('timeManagerId');
    const storedWorkedTime = localStorage.getItem('workedTime') || '00:00:00';

    if (new Date(end) <= new Date(startTime)) {
      setError('End time must be greater than start time.');
      return;
    }

    // Update time manager
    try {
      await axios.post(`${trackingUrl}/update_timemanager.php`, {
        id,
        task_id:selectedTask,
        endTime: end,
        duration
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Update task's worked time
      const updatedWorkedTime = addDuration(storedWorkedTime, duration);
      await axios.post(`${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Planning/tasks/update_task.php`, {
        id: selectedTask,
        worked_time: updatedWorkedTime
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      localStorage.removeItem('timeManagerId');
      localStorage.removeItem('startTime');
      localStorage.removeItem('task_id');
      localStorage.setItem('workedTime', updatedWorkedTime);
      setIsStarted(false);
      setElapsedTime('');
      setMessage('Task and time manager updated successfully.');
      fetchTasks();
    } catch (error) {
      setError('An error occurred while ending the activity.');
    }
  };

  const addDuration = (baseTime, addedTime) => {
    const [baseHours, baseMinutes, baseSeconds] = baseTime.split(':').map(Number);
    const [addedHours, addedMinutes, addedSeconds] = addedTime.split(':').map(Number);

    let totalSeconds = baseSeconds + addedSeconds;
    let totalMinutes = baseMinutes + addedMinutes + Math.floor(totalSeconds / 60);
    let totalHours = baseHours + addedHours + Math.floor(totalMinutes / 60);

    totalSeconds = totalSeconds % 60;
    totalMinutes = totalMinutes % 60;

    return `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div>
        <h1 className="add-time-manager-title">New Activity</h1>
        <div className="history-button">
          <button className="remove-category-button" type="button" onClick={() => navigate('/timemanager/history')}>History</button>
          <button className="remove-category-button" type="button" onClick={() => navigate('/timemanager/configuration')}>Configuration</button>
        </div>
        <div className="add-time-manager-container">
            <div>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Task Name</th>
                    <th>Deadline</th>
                    <th>Estimated Time</th>
                    <th>Worked Time</th>
                    <th>Accomplishment Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <input
                          type="radio"
                          name="task"
                          value={task.id}
                          checked={selectedTask === task.id}
                          onChange={(e) => {
                            setSelectedTask(e.target.value);
                            setWorkedTime(task.worked_time);
                            setTaskIsSelected(true);
                          }}
                        />
                      </td>
                      <td>{task.name}</td>
                      <td>{task.deadline}</td>
                      <td>{task.estimated_time}</td>
                      <td>{task.worked_time}</td>
                      <td>{calculateAccomplishmentRate(task.worked_time, task.estimated_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="center-buttons">
                <button
                type="button"
                className={`add-time-manager-button ${
                  !taskIsSelected
                    ? ''
                    : 'add-time-manager-button-start'
                }`}
                onClick={handleStart}
                disabled={localStorage.getItem('task_id')}
                >
                  Start
                </button>
                  <button
                  type="button"
                  className={`add-time-manager-button ${
                    localStorage.getItem('task_id')
                      ? 'add-time-manager-button-end'
                      : ''
                  }`}
                  onClick={handleEnd}
                  disabled={!localStorage.getItem('task_id')}
                >
                  End
                </button>
                
              </div>
              {elapsedTime && (
                  <div className="add-time-manager-elapsed-time">{elapsedTime}</div>
                )}
            </div>

            

            {/* {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>} */}
            {/* {elapsedTime && <p className="elapsed-time">Elapsed Time: {elapsedTime}</p>} */}
            
          </div>
        </div>
      </div>
  );
}

export default AddTimeManager;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importez les composants Router, Routes, et Route

import GetTimeManager from './components/TimeManager/GetTimeManager/GetTimeManager';
import AddTimeManager from './components/TimeManager/AddTimeManager/AddTimeManager';
import ConfigureTimeManager from './components/TimeManager/ConfigureTimeManager/ConfigureTimeManager';
import TimeManagerNavBar from './components/TimeManager/TimeManagerNavBar/TimeManagerNavBar';
import GanttChart from './components/TimeManager/GetTimeManager/GanttChart/GanttChart';
import Database from './components/TimeManager/GetTimeManager/Database';

import './App.css';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<TimeManagerNavBar/>}>
            <Route path="/timemanager/add-activity" element={<AddTimeManager/>}/>
            <Route path="/timemanager/activities" element={<GetTimeManager/>}/>
            <Route path="/timemanager/configuration" element={<ConfigureTimeManager/>}/>
            <Route path="/timemanager/ganttchart" element={<GanttChart/>}/>
            <Route path="/timemanager/database" element={<Database/>}/>
          </Route>
        </Routes>
    </Router>
  );
}

export default App;

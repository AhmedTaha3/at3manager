import './App.css';
import GetTimeManager from './components/TimeManager/GetTimeManager/GetTimeManager';
import AddTimeManager from './components/TimeManager/AddTimeManager/AddTimeManager';
import TimeManagerNavBar from './components/TimeManager/TimeManagerNavBar/TimeManagerNavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importez les composants Router, Routes, et Route
function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<TimeManagerNavBar/>}>
            <Route path="/timemanager/add-activity" element={<AddTimeManager/>}/>
            <Route path="/timemanager/activities" element={<GetTimeManager/>}/>
          </Route>
        </Routes>
    </Router>
  );
}

export default App;

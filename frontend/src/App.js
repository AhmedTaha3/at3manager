import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importez les composants Router, Routes, et Route

import AddTimeManager from './components/TimeManager/Tracking/AddTimeManager/AddTimeManager';
import ConfigureTimeManager from './components/TimeManager/Tracking/ConfigureTimeManager/ConfigureTimeManager';
import TimeManagerNavBar from './components/TimeManager/TimeManagerNavBar/TimeManagerNavBar';
import History from './components/TimeManager/Tracking/History';
import ConfigureMoneyAccounts from './components/MoneyManager/ConfigureMoneyManager/ConfigureMoneyAccounts';
import ConfigureMoneyCategories from './components/MoneyManager/ConfigureMoneyManager/ConfigureMoneyCategories';
import AddTransaction from './components/MoneyManager/AddTransaction/AddTransaction';
import Engagements from './components/TimeManager/Planning/Engagements/Engagements';
import Evaluating from './components/TimeManager/Evaluating/Evaluating';
import './App.css';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<TimeManagerNavBar/>}>
            {/* TIME MANAGER */}
            <Route path="/timemanager/add-activity" element={<AddTimeManager/>}/>
            <Route path="/timemanager/configuration" element={<ConfigureTimeManager/>}/>
            <Route path="/timemanager/history" element={<History/>}/>
            <Route path='/timemanager/evaluating' element={<Evaluating/>}/>
            <Route path="/timemanager/planning" element={<Engagements/>}/>
            {/* MONEY MANAGER */}
            <Route path="/moneymanager/configuration-accounts" element={<ConfigureMoneyAccounts/>}/>
            <Route path="/moneymanager/configuration-categories" element={<ConfigureMoneyCategories/>}/>
            <Route path="/moneymanager/add-transaction" element={<AddTransaction/>}/>
          </Route>
        </Routes>
    </Router>
  );
}

export default App;

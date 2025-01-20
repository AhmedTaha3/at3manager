import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GanttChartByWeek from './GanttChartByWeek/GanttChartByWeek';
import HistogramByWeek from './HistogramByWeek/HistogramByWeek';
import HistogramByMonth from './HistogramByMonth/HistogramByMonth';
import HistogramByWeekByActivity from './HistorgamByWeekByActivity/HistorgamByWeekByActivity';
import HistogramByMonthByActivity from './HistogramByMonthByActivity/HistogramByMonthByActivity';
import './Evaluating.css'; 
const Evaluating =  ()=> {
    return(
        <div>
            <div>
                <GanttChartByWeek/>   
            </div>
            <div className='evaluation-container'>
                <HistogramByWeek/>
                <HistogramByWeekByActivity/>
            </div>
            <div className='evaluation-container'>
                
                <HistogramByMonthByActivity/>
                <HistogramByMonth/>
            </div>
        </div>
    );
}

export default Evaluating
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GanttChartByWeek from './GanttChartByWeek/GanttChartByWeek';
import HistogramByWeek from './HistogramByWeek/HistogramByWeek'
const Evaluating =  ()=> {
    return(
        <div>
            {/* <GanttChartByWeek/> */}
            <HistogramByWeek/>
        </div>
    );
}

export default Evaluating
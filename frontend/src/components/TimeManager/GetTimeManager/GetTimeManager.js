import GanttChart from './GanttChart/GanttChart';
import Histogram from './HISTOGRAM/Histogram';
import HistogramTest from './HISTOGRAM/HistogramTest';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function GetTimeManager() {

  return (
    <div>
      {/* <GanttChart/> */}
      {/* <Histogram/> */}
      <HistogramTest/>
    </div>
  );
}

export default GetTimeManager;

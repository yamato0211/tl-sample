import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Auth from './Auth';
import Timeline from './Timeline';
import Events from './Events';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path='/auth' element={<Auth />} />
          <Route path="/timeline/:eventId" element={<Timeline />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

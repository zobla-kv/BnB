import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Form from './components/Form/Form';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to='/form/step/1' replace />} />
        <Route path='/form/*' element={<Form />} />
      </Routes>
    </Router>
  );
}

export default App;

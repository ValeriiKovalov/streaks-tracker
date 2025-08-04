import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Streak from './pages/Streak.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/streak/:caseId" element={<Streak/>}/>
      </Routes>
    </Router>
  );
}

export default App;

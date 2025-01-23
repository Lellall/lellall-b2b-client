import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './features/layout/layout';
import Inventory from './features/inventory';

const App = () => (
  <Router>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<div>hello</div>} />
      <Route path="profile" element={<div>profile</div>} />
      <Route path="settings" element={<div>settings</div>} />
      <Route path="inventory" element={<Inventory />} />
    </Route>
  </Routes>
</Router>
);

export default App;

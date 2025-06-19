import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Personnel from './pages/Personnel/Personnel';
import Inventory from './pages/Inventory/Inventory';
import Vehicles from './pages/Vehicles/Vehicles';
import Assignments from './pages/Assignments/Assignments';
import History from './pages/History/History';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/personnel" element={<Personnel />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
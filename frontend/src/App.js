import './App.css';
import React, { useState, useEffect } from 'react';
import { Grid, Paper } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import LoginRegister from './components/LoginRegister';

const API = "http://localhost:3001";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Kiểm tra session khi load lại trang
  useEffect(() => {
    fetch(`${API}/api/admin/session`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((user) => { setCurrentUser(user); setSessionChecked(true); })
      .catch(() => setSessionChecked(true));
  }, []);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => { setCurrentUser(null); };
  const handleRefresh = () => setRefreshKey((k) => k + 1);

  if (!sessionChecked) return null; // chờ check session xong

  return (
    <Router>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar
              currentUser={currentUser}
              onLogout={handleLogout}
              onPhotoUploaded={handleRefresh}
            />
          </Grid>
          <div className="main-topbar-buffer" />

          {!currentUser ? (
            // Chưa đăng nhập — chỉ hiển thị LoginRegister
            <Grid item xs={12}>
              <LoginRegister onLogin={handleLogin} />
            </Grid>
          ) : (
            // Đã đăng nhập — hiển thị full layout
            <>
              <Grid item sm={3}>
                <Paper className="main-grid-item">
                  <UserList refreshKey={refreshKey} />
                </Paper>
              </Grid>
              <Grid item sm={9}>
                <Paper className="main-grid-item">
                  <Routes>
                    <Route path="/users/:userId" element={<UserDetail />} />
                    <Route path="/photos/:userId" element={<UserPhotos refreshKey={refreshKey} />} />
                    <Route path="/users" element={<UserList refreshKey={refreshKey} />} />
                    <Route path="*" element={<Navigate to="/users" />} />
                  </Routes>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </div>
    </Router>
  );
};

export default App;

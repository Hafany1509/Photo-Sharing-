import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData';

const API = "http://localhost:3001";

function TopBar({ currentUser, onLogout, onPhotoUploaded }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [contextText, setContextText] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const parts = location.pathname.split('/');
    const section = parts[1];
    const id = parts[2];
    if ((section === 'users' || section === 'photos') && id) {
      fetchModel(`${API}/api/user/${id}`)
        .then(({ data }) => {
          setContextText(section === 'users'
            ? `${data.first_name} ${data.last_name}`
            : `Photos of ${data.first_name} ${data.last_name}`);
        })
        .catch(() => setContextText(''));
    } else {
      setContextText('');
    }
  }, [location]);

  const handleLogout = async () => {
    await fetch(`${API}/api/admin/logout`, {
      method: 'POST', credentials: 'include',
    });
    onLogout();
    navigate('/');
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch(`${API}/api/photo/new`, {
      method: 'POST', credentials: 'include', body: formData,
    });
    if (res.ok) {
      onPhotoUploaded();
    } else {
      alert('Upload failed');
    }
    e.target.value = '';
  };

  return (
    <AppBar position="absolute">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="inherit">Lê Huy Hải</Typography>
        <Typography variant="h6" color="inherit">{contextText}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentUser ? (
            <>
              <Typography variant="body1" color="inherit">
                Hi {currentUser.first_name}
              </Typography>
              <input type="file" accept="image/*" ref={fileInputRef}
                style={{ display: 'none' }} onChange={handleUpload} />
              <Button variant="outlined" color="inherit" size="small"
                onClick={() => fileInputRef.current.click()}>
                Add Photo
              </Button>
              <Button variant="outlined" color="inherit" size="small"
                onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Typography variant="body1" color="inherit">Please Login</Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;

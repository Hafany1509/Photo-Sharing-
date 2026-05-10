import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Divider, Alert, Stack, Tab, Tabs
} from '@mui/material';

const API = "http://localhost:3001";

function LoginRegister({ onLogin }) {
  const [tab, setTab] = useState(0);

  // Login state
  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register state
  const [reg, setReg] = useState({
    login_name: '', password: '', confirm_password: '',
    first_name: '', last_name: '', location: '',
    description: '', occupation: '',
  });
  const [regError, setRegError]   = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // ── Login ────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ login_name: loginName, password: loginPass }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setLoginError(msg);
        return;
      }
      const user = await res.json();
      onLogin(user);
    } catch (err) {
      setLoginError('Cannot connect to server.');
    }
  };

  // ── Register ─────────────────────────────────────────────
  const handleRegister = async () => {
    setRegError('');
    setRegSuccess('');
    if (!reg.login_name)  return setRegError('Login name is required.');
    if (!reg.password)    return setRegError('Password is required.');
    if (!reg.first_name)  return setRegError('First name is required.');
    if (!reg.last_name)   return setRegError('Last name is required.');
    if (reg.password !== reg.confirm_password)
      return setRegError('Passwords do not match.');

    try {
      const res = await fetch(`${API}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reg),
      });
      if (!res.ok) {
        const msg = await res.text();
        setRegError(msg);
        return;
      }
      setRegSuccess(`Account "${reg.login_name}" created! You can now log in.`);
      setReg({
        login_name: '', password: '', confirm_password: '',
        first_name: '', last_name: '', location: '',
        description: '', occupation: '',
      });
    } catch (err) {
      setRegError('Cannot connect to server.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Card variant="outlined" sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom color="primary">
            📷 Photo Sharing
          </Typography>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {/* ── LOGIN TAB ── */}
          {tab === 0 && (
            <Stack spacing={2}>
              <TextField
                label="Login Name"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                fullWidth size="small"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <TextField
                label="Password"
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                fullWidth size="small"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              {loginError && <Alert severity="error">{loginError}</Alert>}
              <Button variant="contained" onClick={handleLogin} fullWidth>
                Login
              </Button>
              <Typography variant="caption" color="text.secondary" align="center">
                Default accounts: ian / ellen / peregrin / rey / april / john (password: password)
              </Typography>
            </Stack>
          )}

          {/* ── REGISTER TAB ── */}
          {tab === 1 && (
            <Stack spacing={2}>
              <Divider>Account Info</Divider>
              <TextField label="Login Name *" value={reg.login_name}
                onChange={(e) => setReg({ ...reg, login_name: e.target.value })}
                fullWidth size="small" />
              <TextField label="Password *" type="password" value={reg.password}
                onChange={(e) => setReg({ ...reg, password: e.target.value })}
                fullWidth size="small" />
              <TextField label="Confirm Password *" type="password" value={reg.confirm_password}
                onChange={(e) => setReg({ ...reg, confirm_password: e.target.value })}
                fullWidth size="small" />
              <Divider>Personal Info</Divider>
              <Stack direction="row" spacing={1}>
                <TextField label="First Name *" value={reg.first_name}
                  onChange={(e) => setReg({ ...reg, first_name: e.target.value })}
                  fullWidth size="small" />
                <TextField label="Last Name *" value={reg.last_name}
                  onChange={(e) => setReg({ ...reg, last_name: e.target.value })}
                  fullWidth size="small" />
              </Stack>
              <TextField label="Location" value={reg.location}
                onChange={(e) => setReg({ ...reg, location: e.target.value })}
                fullWidth size="small" />
              <TextField label="Occupation" value={reg.occupation}
                onChange={(e) => setReg({ ...reg, occupation: e.target.value })}
                fullWidth size="small" />
              <TextField label="Description" value={reg.description}
                onChange={(e) => setReg({ ...reg, description: e.target.value })}
                fullWidth size="small" multiline rows={2} />
              {regError   && <Alert severity="error">{regError}</Alert>}
              {regSuccess && <Alert severity="success">{regSuccess}</Alert>}
              <Button variant="contained" onClick={handleRegister} fullWidth>
                Register Me
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginRegister;

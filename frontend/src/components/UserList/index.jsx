import React, { useState, useEffect } from 'react';
import { Divider, List, ListItemButton, ListItemText, Typography, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData';

const API = "http://localhost:3001";

function UserList({ refreshKey }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchModel(`${API}/api/user/list`)
      .then(({ data }) => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <CircularProgress sx={{ margin: 2 }} />;

  return (
    <div>
      <Typography variant="h6" sx={{ padding: '16px', fontWeight: 'bold' }}>Users</Typography>
      <Divider />
      <List component="nav" disablePadding>
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItemButton component={Link} to={`/users/${user._id}`}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItemButton>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;

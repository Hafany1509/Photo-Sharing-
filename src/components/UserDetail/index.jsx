import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, CardContent, Divider, Box, Stack, CircularProgress } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData';

const API = "http://localhost:3001";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchModel(`${API}/api/user/${userId}`)
      .then(({ data }) => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return <CircularProgress sx={{ margin: 2 }} />;
  if (!user) return <Typography sx={{ padding: 2 }}>User not found.</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" gutterBottom color="primary">
            {user.first_name} {user.last_name}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1}>
            <Typography variant="body1"><strong>Location:</strong> {user.location}</Typography>
            <Typography variant="body1"><strong>Occupation:</strong> {user.occupation}</Typography>
            <Typography variant="body1"><strong>Description:</strong> {user.description}</Typography>
          </Stack>
          <Button variant="contained" color="primary" component={Link}
            to={`/photos/${userId}`} sx={{ mt: 3 }}>
            View Photos of {user.first_name}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserDetail;

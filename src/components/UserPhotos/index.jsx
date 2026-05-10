import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Card, CardMedia, CardContent, Divider,
  Box, Stack, Chip, CircularProgress, TextField, Button
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData';

const API = "http://localhost:3001";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function UserPhotos({ refreshKey }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({}); // { photoId: text }
  const [submitting, setSubmitting] = useState(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchModel(`${API}/api/user/${userId}`),
      fetchModel(`${API}/api/photo/photosOfUser/${userId}`),
    ]).then(([userRes, photosRes]) => {
      setUser(userRes.data);
      setPhotos(photosRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData, refreshKey]);

  const handleAddComment = async (photoId) => {
    const text = (comments[photoId] || '').trim();
    if (!text) return;
    setSubmitting(photoId);
    const res = await fetch(`${API}/api/photo/commentsOfPhoto/${photoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ comment: text }),
    });
    setSubmitting(null);
    if (res.ok) {
      setComments((prev) => ({ ...prev, [photoId]: '' }));
      loadData();
    }
  };

  if (loading) return <CircularProgress sx={{ margin: 2 }} />;
  if (!user)   return <Typography sx={{ padding: 2 }}>User not found.</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Photos of {user.first_name} {user.last_name}
      </Typography>
      <Stack spacing={3}>
        {photos.map((photo) => (
          <Card key={photo._id} variant="outlined">
            <CardMedia
              component="img"
              image={`${API}/images/${photo.file_name}`}
              alt={`Photo by ${user.first_name}`}
              sx={{ maxHeight: 500, objectFit: 'contain', backgroundColor: '#f5f5f5' }}
            />
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Posted: {formatDate(photo.date_time)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />

              {/* Comments */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Comments ({photo.comments ? photo.comments.length : 0})
              </Typography>
              {photo.comments && photo.comments.length > 0 ? (
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  {photo.comments.map((c) => (
                    <Box key={c._id} sx={{
                      backgroundColor: '#f9f9f9', borderRadius: 1,
                      padding: '10px 14px', borderLeft: '3px solid #1976d2',
                    }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle2" component={Link}
                          to={`/users/${c.user?._id}`} sx={{
                            fontWeight: 'bold', textDecoration: 'none', color: '#1976d2',
                            '&:hover': { textDecoration: 'underline' },
                          }}>
                          {c.user?.first_name} {c.user?.last_name}
                        </Typography>
                        <Chip label={formatDate(c.date_time)} size="small"
                          variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      </Stack>
                      <Typography variant="body2">{c.comment}</Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No comments yet.
                </Typography>
              )}

              {/* Add comment */}
              <Divider sx={{ mb: 1.5 }} />
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  label="Add a comment..." size="small" fullWidth multiline maxRows={3}
                  value={comments[photo._id] || ''}
                  onChange={(e) => setComments((prev) => ({ ...prev, [photo._id]: e.target.value }))}
                />
                <Button variant="contained" size="small"
                  disabled={submitting === photo._id}
                  onClick={() => handleAddComment(photo._id)}
                  sx={{ whiteSpace: 'nowrap', mt: 0.5 }}>
                  Post
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {photos.length === 0 && (
          <Typography color="text.secondary">No photos yet.</Typography>
        )}
      </Stack>
    </Box>
  );
}

export default UserPhotos;

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { Button, IconButton, Stack } from '@mui/material';

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (error) {
        console.error('Failed to fetch meeting history:', error);
      }
    };

    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <h2>Meeting History</h2>
        <IconButton onClick={() => routeTo('/home')} aria-label="go home">
          <HomeIcon />
        </IconButton>
      </Stack>

      {meetings.length !== 0 ? (
        <Stack spacing={2}>
          {meetings.map((meeting, index) => (
            <Card key={index} variant="outlined">
              <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  Meeting ID: {meeting.meetingCode}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Date: {formatDate(meeting.date || meeting.createdAt)}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Joined users: {(meeting.joinedUsers || ['You']).join(', ')}
                </Typography>
                <Button variant="contained" onClick={() => routeTo(`/${meeting.meetingCode}`)}>
                  Rejoin
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary">No meetings saved yet.</Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

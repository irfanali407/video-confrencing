import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

const createMeetingCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const { addToUserHistory, logout } = useContext(AuthContext);

  const handleJoinVideoCall = async (code = meetingCode) => {
    const roomCode = (code || createMeetingCode()).trim();
    if (!roomCode) return;

    try {
      await addToUserHistory(roomCode);
      navigate(`/${roomCode}`);
    } catch (error) {
      console.error('Unable to save meeting history:', error);
      navigate(`/${roomCode}`);
    }
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2>MeetHub</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconButton onClick={() => navigate('/history')} aria-label="meeting history">
            <RestoreIcon />
          </IconButton>
          <span>History</span>
          <Button onClick={logout} variant="outlined">Logout</Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Start or join a meeting in seconds.</h2>
            <p className="subText">Secure video calls, realtime chat, and meeting history built for interviews and demos.</p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                value={meetingCode}
                id="outlined-basic"
                label="Meeting Code"
                variant="outlined"
              />
              <Button onClick={() => handleJoinVideoCall()} variant='contained'>Join</Button>
              <Button onClick={() => handleJoinVideoCall(createMeetingCode())} variant='outlined'>New Meeting</Button>
            </div>
          </div>
        </div>
        <div className="rightPanel">
          <img srcSet='/logo3.png' alt="Video call illustration" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
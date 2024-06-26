import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';

const Timer = ({ initialMinutes = 0, initialSeconds = 0 }) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const history = useHistory();

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);
          history.goBack();
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);

    return () => clearInterval(myInterval);
  }, [seconds, minutes]);

  return (
    <div>
      {minutes === 0 && seconds === 0
        ? <small style={{color:'red'}}>Time's up!</small>
        : <small style={{color:'green'}}>Waiting Time: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</small>
      }
    </div>
  );
};

export default Timer;

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';

const Timer = (props:any) => {
  const [minutes, setMinutes] = useState(props.initialMinutes);
  const [seconds, setSeconds] = useState(props.initialSeconds);
  const history = useHistory();

  useEffect(() => {
  //   let mnTimer = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  // props.callBakTimer(mnTimer);

    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);

          props.timeUpCall()

        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);

    return () => clearInterval(myInterval);

    
  }, [seconds, minutes]);


 

  return (
    <>
      {minutes === 0 && seconds === 0
        ? <small style={{color:'red'}}>Time's up!</small>
        : <span > {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
      }
    
    </>
  );
};

export default Timer;

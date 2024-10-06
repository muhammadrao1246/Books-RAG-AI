import React, { useState } from 'react';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material';
import { tokens } from 'src/theme';

export const timeStringToSeconds = (timeString) => {
  const [hours, minutes, seconds, frames] = timeString.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds + (frames / 30); // Assuming 30 frames per second
};

export const secondsToTimeString = (totalSeconds, isShort=true) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const frames = Math.floor((totalSeconds % 1) * 30); // Assuming 30 frames per second

  if (isShort){
    return [
      String(hours),
      String(minutes),
      String(seconds),
      // String(frames).padStart(2, '0')
    ].join(':');
  }
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
    String(frames).padStart(2, '0')
  ].join(':');
};

const ValueLabelComponent = (props) => {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} placement="top" title={secondsToTimeString(value)}>
      {children}
    </Tooltip>
  );
};


const RangeSlider = ({ timeStamps, startTime, endTime, handleChange, min_step, isDisabled }) => {
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);


  const maxMarksToShow = 5; // Limit number of marks shown
  const step = Math.max(1, Math.floor(timeStamps.length / maxMarksToShow));

  const marks = timeStamps.filter((_, index) => index % step === 0)
    // .map((time, index) => {
    //   let seconds = timeStringToSeconds(time)
    //   return {
    //   value: seconds,
    //   label: secondsToTimeString(seconds)
    // }});

  const min = (timeStamps[0].value);
  const max = (timeStamps[timeStamps.length - 1].value);

  const initialValue = [
    (startTime),
    (endTime)
  ]
  const [sliderValue, setSliderValue] = useState([
    startTime,
    endTime
  ]);

  React.useEffect(() => {
    setSliderValue([(startTime), (endTime)]);
  }, [startTime, endTime]);

  const handleSliderChange = (event, newValue) => {
    console.log("SLider Change",  newValue)
    // if (newValue[0] === newValue[1]){
    //   setSliderValue(initialValue);
    //   handleChange(initialValue);
    // }
    // Enforce minimum interval length and prevent overcrossing
    if (newValue[1] - newValue[0] < min_step) {
      if (newValue[0] === sliderValue[0]) {
        newValue[1] = newValue[0] + min_step;
      } else {
        newValue[0] = newValue[1] - min_step;
      }
    }
    setSliderValue(newValue);
    handleChange(newValue);
  };

  return (
    <Slider
      disabled={isDisabled}
      sx={{width: "65%", color: `${colors.grey[300]} !important`, }}
      // color="secondary"
      value={sliderValue}
      onChange={handleSliderChange}
      step={min_step}
      marks={marks}
      min={min}
      max={max}
      valueLabelDisplay="auto"
      components={{
        ValueLabel: ValueLabelComponent
      }}
    />
  );
};

export default RangeSlider;

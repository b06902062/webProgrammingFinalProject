import React, { useState, useEffect, useRef } from 'react';
import { useCanvas } from './useCanvas.js';

export function useProgressCanvas(){
  const canvasRef = useRef(null);
  const [stop, setStop] = useState(false)

  function stopProgress(){
    console.log('stop progress')
    setStop(true)
  }

  async function progressDraw(n_grids, nPitch, gridSize, notes, ctx, timeOutButt, finish) {
    const halfGridSize = Math.floor(gridSize/2);
    const colors = [
      'aqua', 'cornflowerblue', 'lightblue', 'lightcyan',
      'darksalmon', 'coral', 'lightslamon', 'orange',
      'orangered', 'tomato', 'sandybrown', 'peru'
    ]
    const sleep = (milliseconds) => {
      return new Promise(resolve => {timeOutButt = setTimeout(resolve, milliseconds)})
    }

    ctx.restore();
    ctx.beginPath();
    ctx.clearRect(0, 0, gridSize * n_grids, halfGridSize * nPitch)
  
    const drawOneNote = (elem) => {
      ctx.restore();
      ctx.fillStyle = colors[elem.key%12];
      ctx.globalAlpha = 1;
      ctx.fillRect(elem.start * gridSize, elem.key * halfGridSize, elem.duration * gridSize, halfGridSize);
    }

    let timing = 0;
    for(let index in notes){
      console.log(stop)
      if(stop){
        setStop(false)
        console.log('stoppppppp')
        break;
      }
      let remainTiming = notes[index].time - timing;
      if(remainTiming<=0){
        drawOneNote(notes[index])
      }
      else{
        await sleep(remainTiming*1000);
        timing += remainTiming;
        drawOneNote(notes[index])
      }
    }

    finish();
    ctx.clearRect(0, 0, gridSize * n_grids, halfGridSize * nPitch)
    ctx.closePath();
  }

  return [ canvasRef, progressDraw, stopProgress ];
}

export function ProgressCanvas(props) {
  return (
    <canvas
      className="grid-canvas my-canvas"
      ref={props.forwardedRef}
      width={props.width}
      height={props.height}
    />
  )
}

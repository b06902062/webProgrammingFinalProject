import React, { useState, useEffect, useRef } from 'react';
import { useCanvas } from './useCanvas.js';

export function useProgressCanvas(){
  const canvasRef = useRef(null);
  const [ noneRef, canvasWidth, canvasHeight, gridSize, n_grids, nPitch] = useCanvas();
  
  function progressClear(){
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const halfGridSize = Math.floor(gridSize/2);
    ctx.restore();
    ctx.beginPath();
    ctx.clearRect(0, 0, gridSize * n_grids, halfGridSize * nPitch);
    ctx.closePath();
  }

  async function progressDraw(notes, timeOutButt, timeOutButt2) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const halfGridSize = Math.floor(gridSize/2);
    const colors = [
      'aqua', 'cornflowerblue', 'lightblue', 'lightcyan',
      'darksalmon', 'coral', 'lightsalmon', 'orange',
      'orangered', 'tomato', 'sandybrown', 'peru'
    ]
    ctx.restore();
    ctx.beginPath();
    ctx.clearRect(0, 0, gridSize * n_grids, halfGridSize * nPitch)
    
    const drawOneNote = (elem) => {
      ctx.restore();
      ctx.fillStyle = colors[elem.key%12];
      ctx.globalAlpha = 1;
      ctx.fillRect(elem.start * gridSize, canvasHeight - elem.key * halfGridSize, (elem.end-0.5) * gridSize, halfGridSize);
    }

    const clearOneNote = (elem) =>{
      ctx.restore();
      ctx.clearRect(elem.start * gridSize, canvasHeight - elem.key * halfGridSize, (elem.end-0.5) * gridSize, halfGridSize);
    }

    notes.forEach((elem, index)=>{
      timeOutButt[index] = setTimeout(()=>{
        drawOneNote(elem, 1);
        timeOutButt2[index] = setTimeout(()=>{
          //console.log('index = ', index, 'finish time = ', elem.time+elem.duration)
          clearOneNote(elem)
        },elem.duration*1000)
      }, elem.time*1000);
    })
    
    // ctx.clearRect(0, 0, gridSize * n_grids, halfGridSize * nPitch)
    ctx.closePath();
  }

  return [ canvasRef, progressDraw, progressClear ];
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
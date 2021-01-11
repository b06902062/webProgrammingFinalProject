import React, { useEffect, useRef } from 'react';
import { useWindowSize } from './useCanvas.js';

/* ========================================================================== */
const n_grids_per_bar = 16;
const n_bars = 8;
const n_grids = n_grids_per_bar * n_bars; // number of grids in horizontal direction
const n_pitch = 64; // number of grids in vertical direction
/* ========================================================================== */

export function draw(ctx, canvasWidth, canvasHeight, gridSize){
  const halfGridSize = Math.floor(gridSize/2);
  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  for(let i = 0; i < canvasHeight; i++){
    let flag = Math.floor(i/halfGridSize)%12;
    ctx.restore();
    ctx.globalAlpha = 1;
    if(flag === 1 || flag === 3 || flag === 6 || flag === 8 || flag === 10){
      ctx.fillStyle = 'rgba(30, 30, 30, 1)';
      ctx.fillRect(0, i, canvasWidth, 1);
    }
    else{
      ctx.fillStyle = 'rgba(60, 60, 60, 1)';
      ctx.fillRect(0, i, canvasWidth, 1);
    }
  }

  ctx.beginPath();
  for (let i = 0; i < canvasWidth; i += gridSize) {
    ctx.lineWidth = (1.0+((i/gridSize%n_grids_per_bar)===0)*5)*0.1;
    if ((i/gridSize%n_grids_per_bar)===0)
      ctx.strokeStyle = 'gray';
    else
      continue; //ctx.strokeStyle = '#717171';
    ctx.beginPath();
    ctx.moveTo(i + 0.5, 0);
    ctx.lineTo(i + 0.5, canvasHeight);
    ctx.stroke();
  }
  for (let i = 0; i < canvasHeight; i += halfGridSize) {
    ctx.lineWidth = (1.0+((i/halfGridSize%12)===4)*5)*0.1; // [myRef]
    if ((i/halfGridSize%12)===4)
      ctx.strokeStyle = 'gray';
    else
      continue; //ctx.strokeStyle = '#717171';'#F5927E'
    ctx.beginPath();
    ctx.moveTo(0, i + 0.5);
    ctx.lineTo(canvasWidth, i + 0.5);
    ctx.stroke();
  }
  ctx.restore();
};

export function useGridCanvas(){
    const canvasRef = useRef(null);
    let [window_width, window_height] = useWindowSize();
    // if (window_width < 1000)
    //   window_width = 1000;
    const canvasWidth = window_width - window_width % n_grids;
    const canvasHeight = Math.floor(canvasWidth / n_grids) * n_pitch;
    const gridSize = Math.floor(canvasWidth / n_grids);

    useEffect(()=>{
        const canvasObj = canvasRef.current;
        const ctx = canvasObj.getContext('2d');
        // clear the canvas area before rendering the coordinates held in state
        ctx.clearRect( 0,0, canvasWidth, canvasHeight );

        draw(ctx, canvasWidth, canvasHeight, gridSize);
    }, [canvasWidth, canvasHeight, gridSize]);

    return [ canvasRef ];
}

export function GridCanvas(props) {
  return (
    <canvas
      className="grid-canvas my-canvas"
      ref={props.forwardedRef}
      width={props.width}
      height={props.height}
    />
  )
}


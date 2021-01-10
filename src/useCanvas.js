import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

/* ========================================================================== */
const n_grids_per_bar = 16;
const n_bars = 8;
const n_grids = n_grids_per_bar * n_bars; // number of grids in horizontal direction
const n_pitch = 64; // number of grids in vertical direction
/* ========================================================================== */

/* Change window size when resizing window */
export function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

export function myDraw(n_grids, nPitch, gridSize, notes, color, ctx) {
  ctx.restore();
  ctx.beginPath();
  ctx.clearRect(0, 0, gridSize * n_grids, gridSize * nPitch)

  for(let note of notes){
    if(note.key < 0 || note.key >= n_pitch){
      continue;
    }
    ctx.restore();
    ctx.fillStyle = color;
    ctx.globalAlpha = note.gain;
    ctx.fillRect(note.start * gridSize, note.key * gridSize, note.duration * gridSize, gridSize);
  }

  ctx.closePath();
}

export function useCanvas(){
    const canvasRef = useRef(null);
    let [window_width, window_height] = useWindowSize();
    if (window_width < 1000)
      window_width = 1000;
    const canvasWidth = window_width - window_width % n_grids;
    const canvasHeight = Math.floor(canvasWidth / n_grids) * n_pitch;
    const gridSize = Math.floor(canvasWidth / n_grids);
    console.log("width, height, gridSize of drawCanvas:", canvasWidth, canvasHeight, gridSize);

    return [canvasRef, canvasWidth, canvasHeight, n_grids, n_pitch, gridSize];
}

export function Canvas(props) {
  return (
    <canvas
      className="App-canvas my-canvas"
      ref={props.forwardedRef}
      width={props.width}
      height={props.height}
    />
  )
}

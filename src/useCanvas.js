import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

/* ========================================================================== */
const n_grids_per_bar = 16;
const n_bars = 8;
const n_grids = n_grids_per_bar * n_bars; // number of grids in horizontal direction
const n_pitch = 88; // number of grids in vertical direction
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

export function myDraw(canvasHeight, n_grids, nPitch, gridSize, notes, ctx) {
  const halfGridSize = Math.floor(gridSize/2);
  const colors = [
    'aqua', 'cornflowerblue', 'lightblue', 'lightcyan',
    'darksalmon', 'coral', 'lightslamon', 'orange',
    'orangered', 'tomato', 'sandybrown', 'peru'
  ]
  const colors1 = [
    'mediumorchid', 'paleturqoise', 'salmon', 'mediumseagreen',
    'navajowhite', 'hotpink', 'gold', 'turqoise',
    'violet', 'palegreen', 'tomato', 'skyblue'
  ]
  ctx.restore();
  ctx.beginPath();
  ctx.clearRect(0, 0, gridSize * n_grids, halfGridSize * nPitch)

  for(let note of notes){
    if(note.key < 0 || note.key >= nPitch){
      continue;
    }
    ctx.restore();
    ctx.fillStyle = colors[note.key%12];
    ctx.globalAlpha = note.gain;
    ctx.fillRect(note.start * gridSize, canvasHeight - note.key * halfGridSize, (note.duration-0.5) * gridSize, halfGridSize);
  }

  ctx.closePath();
}

export function useCanvas(){
    const canvasRef = useRef(null);
    let [window_width, window_height] = useWindowSize();
    // if (window_width > 1000)
    //   window_width -= 100;
    const canvasWidth = 0.8*window_width - 0.8*window_width % n_grids;
    const canvasHeight = Math.floor(canvasWidth / n_grids) * n_pitch/2;
    const gridSize = Math.floor(canvasWidth / n_grids);
    //console.log("width, height, gridSize of drawCanvas:", canvasWidth, canvasHeight, gridSize);

    return [canvasRef, canvasWidth, canvasHeight, gridSize, n_grids, n_pitch, n_bars, n_grids_per_bar, window_width, window_height];
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

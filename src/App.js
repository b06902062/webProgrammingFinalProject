import Soundfont from 'soundfont-player'
import './App.css'
import { useEffect, useRef, useState } from 'react';
import ButtonList from './buttonList.js'
import { getInitPiece, composeRequest } from './axios'
import { useCanvas, Canvas, myDraw } from './useCanvas.js';
import { useGridCanvas, GridCanvas } from './useGridCanvas.js';
import { useProgressCanvas, ProgressCanvas, progressDraw, stopProgress } from './useProgressCanvas.js';

//import 'antd/dist/antd.css';
import {
  PlayCircleFilled,
  PauseCircleFilled,
  SlidersFilled,
} from '@ant-design/icons';
import { Space, Divider } from 'antd';

let ac, pianoPlayer, timeOutButt;

function App() {
  /***** Audio Playing *****/
  const [initNotes, setInitNotes] = useState([])
  const [composedNotes, setComposedNotes] = useState([])
  const [isPlayingInit, setIsPlayingInit] = useState(false)
  const [isPlayingComposed, setIsPlayingComposed] = useState(false)

  const tick2Sec = (tic, tpb = 480) => {
    return parseFloat(60*tic/tempo/tpb);
  }
  
  const midi2Play = e => {
    return {
      time: tick2Sec(e.start_tick),
      note: e.key,
      gain: 5*e.velocity/128,
      duration: tick2Sec(e.duration)
    }
  }

  const midi2Progress = e => {
    return {
      time: tick2Sec(e.start_tick),
      start: Math.floor(e.start_tick/120),
      key: e.key - 20, // [myRef]
      gain: e.velocity/128,
      duration: Math.floor(e.duration/120)
    }
  }

  const myPlayer = (player, notes, setFunc) => {
    return new Promise((resolve) => {
      const noteSched = notes.map(midi2Play)
      const noteProgress = notes.map(midi2Progress)
      const timeoutSec = 1000 * (noteSched[ noteSched.length - 1 ].time + noteSched[ noteSched.length - 1 ].duration);
      const canvas = progressCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const finish = ()=>{
        console.log('finish')
        clearTimeout(timeOutButt)
        setFunc(false)
        resolve();
      }
      player.schedule(ac.currentTime, noteSched)
      progressDraw(nGrids, nPitch, gridSize, noteProgress, ctx, timeOutButt, finish);
      
      // timeOutButt = setTimeout(() => {
      //  setFunc(false)
      //  resolve()
      // }, timeoutSec)
    })
  }

  const playButton = (tag) => {
    return async() => {
      const isPlaying = (tag === "i")? isPlayingInit : isPlayingComposed
      const notes = (tag === "i")? initNotes : composedNotes
      const setFunc = (tag === "i")?
        ele => {setIsPlayingInit(ele)} :
        ele => {setIsPlayingComposed(ele)}

      if(isPlaying){
        pianoPlayer.stop()
        // setFunc(false)
        // clearTimeout(timeOutButt)
        stopProgress()
      }
      else{
        setFunc(true)
        await myPlayer(pianoPlayer, notes, setFunc)
      }
    }
  }

  useEffect( async () => {
    ac = new window.AudioContext();
    pianoPlayer = await Soundfont.instrument(ac, 'acoustic_grand_piano', { soundfont: 'MusyngKite' });
  }, [])

  /***** Button  List  React *****/
  const [polyph, setPolyph] = useState([])
  const [rhythm, setRhythm] = useState([])
  const [pLock, setPLock] = useState(true)
  const [rLock, setRLock] = useState(true)

  const toggleFunc = (index, op, typ) => {
    return (() => {
      (typ === "polyph")?
        pLock?
          setPolyph(polyph.map(ele => (ele + op))) :
          setPolyph(polyph.map((ele, ind) => ((ind === index)? ele + op : ele)))
        :
        rLock?
          setRhythm(rhythm.map(ele => (ele + op))) :
          setRhythm(rhythm.map((ele, ind) => ((ind === index)? ele + op : ele)))
    })
  }

  const pLockFunc = () => {
    if(pLock){
      setPolyph(polyph.map(ele => Math.max(Math.min(ele, 7), 0)))
    }
    setPLock(!pLock) 
  }

  const rLockFunc = () => {
    if(rLock){
      setRhythm(rhythm.map(ele => Math.max(Math.min(ele, 7), 0)))
    }
    setRLock(!rLock)
  }

  /***** Webserver requests *****/
  const [refId, setRefId] = useState(-1)
  const [tempo, setTempo] = useState(120)
  const [isComposing, setIsComposing] = useState(false)
  const [hasComposed, setHasComposed] = useState(false)

  useEffect( async () => {
    ac = new window.AudioContext();
    pianoPlayer = await Soundfont.instrument(ac, 'acoustic_grand_piano', { soundfont: 'MusyngKite' });
    let initPiece = await getInitPiece();
    setTempo(initPiece.tempo);
    setRefId(initPiece.ref_id);
    setInitNotes(initPiece.notes);
    setPolyph(initPiece.attr_cls.polyph);
    setRhythm(initPiece.attr_cls.rhythm);
  }, [])

  const composeFunc = async () => {
    setIsComposing(true);
    let composedPiece = await composeRequest(
      refId, tempo, {
        polyph: polyph,
        rhythm: rhythm
      }
    );
    setComposedNotes(composedPiece.notes);
    setIsComposing(false);
    setHasComposed(true);
  }

  /***** Canvas render *****/
  const [ canvasRef, canvasWidth, canvasHeight, gridSize, nGrids, nPitch] = useCanvas();
  const [ gridCanvasRef ] = useGridCanvas();
  const [ progressCanvasRef, progressDraw, stopProgress] = useProgressCanvas();

  const midi2Show = e => {
    return {
      start: Math.floor(e.start_tick/120),
      key: e.key - 20, // [myRef]
      gain: e.velocity/128,
      duration: Math.floor(e.duration/120)
    }
  }

  useEffect( async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let notes = initNotes.map(midi2Show);
    myDraw(nGrids, nPitch, gridSize, notes, ctx);
  }, [initNotes, canvasHeight, canvasWidth])

  
  return (
    <div className="App">
      <header className="App-header">
        <Space style={{width:'100%', height:canvasHeight}}>
          <div id="canvas-container" style={{width:canvasWidth, height:canvasHeight}}>
            <Canvas
              forwardedRef={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              />
            <GridCanvas
              forwardedRef={gridCanvasRef}
              width={canvasWidth}
              height={canvasHeight}
              />
            <ProgressCanvas
              forwardedRef={progressCanvasRef}
              width={canvasWidth}
              height={canvasHeight}
            />
            </div>
          </Space>
        <Space split={<Divider type="vertical"/>}>
          <div id="play">
            <button className="my-button1" onClick={playButton("i")}>
              {isPlayingInit? 
              <PauseCircleFilled title="Pause"/> : 
              <PlayCircleFilled title="Play"/>}
              </button>
            </div>
          <Space direction='vertical'>
            <ButtonList attrType='title'/>
            <ButtonList 
              toggleFunc={toggleFunc} lockFunc={rLockFunc} 
              locked={rLock} attrData={rhythm}
              attrType="rhythm"/>
            <ButtonList 
              toggleFunc={toggleFunc} lockFunc={pLockFunc}
              locked={pLock} attrData={polyph}
              attrType="polyph"/>
            </Space>
          <div id="request">
            <button className="my-button3" onClick={composeFunc} disabled={isComposing}>
              {hasComposed? 
                <SlidersFilled title="Reompose"/> : 
                <SlidersFilled title="Compose"/>}
            </button>
          </div>
          </Space>
        
        {/* <div id="playComposed">
          <button onClick={playButton("c")} disabled={!hasComposed}>
            {isPlayingComposed? "Stop" : "Play Composed Music"}
          </button>
        </div> */}
      </header>
    </div>
  );
}

export default App;
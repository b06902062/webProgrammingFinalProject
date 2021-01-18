import Soundfont from 'soundfont-player'
import './App.css'
import { useEffect, useRef, useState } from 'react';
import { 
  downloadSongRequest,
  rateSongRequest
} from './axios'
import { useCanvas, Canvas, myDraw } from './useCanvas.js';
import { useGridCanvas, GridCanvas } from './useGridCanvas.js';
import { useProgressCanvas, ProgressCanvas, progressDraw, stopProgress } from './useProgressCanvas.js';

import 'antd/dist/antd.css';
import {
  PlayCircleFilled,
  PauseCircleFilled,
  DownloadOutlined,
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
} from '@ant-design/icons';
import { Space, Divider, Typography, Spin } from 'antd';

const { Title, Text } = Typography;

let ac, pianoPlayer, timeOutButt;
function RecPage(props) {
  const [isPlaying, setIsPlaying] = useState(new Array(props.n_results+1).fill(false))
  const [isAnyonePlaying, setIsAnyonePlaying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(new Array(props.n_results+1).fill(false))
  const [myImg, setMyImg] = useState([])

  const midi2Play = (tempo)=>{
    const tick2Sec = (tic, tpb = 480) => {
      return parseFloat(60*tic/tempo/tpb);
    }
    
    return  (e => {
      return {
        time: tick2Sec(e.start_tick),
        note: e.key,
        gain: 5*e.velocity/128,
        duration: tick2Sec(e.duration)
      }
    })
  }

  const myPlayer = (player, notes, tempo, setFunc) => {
    return new Promise((resolve) => {
      const noteSched = notes.map(midi2Play(tempo))
      const timeoutSec = 1000 * (noteSched[ noteSched.length - 1 ].time + noteSched[ noteSched.length - 1 ].duration);

      player.schedule(ac.currentTime, noteSched)
      
      timeOutButt = setTimeout(() => {
       setFunc()
       setIsAnyonePlaying(false)
       resolve()
      }, timeoutSec)
    })
  }

  const play = async(index)=>{
    const notes = (index === 0)? props.composedSong.notes : props.recommendations[index-1].notes
    const setFunc = ()=>{setIsPlaying(isPlaying.map((ele, ind)=>(ind === index? !ele : ele)))}

    if(isPlaying[index]){
      pianoPlayer.stop()
      setFunc()
      setIsAnyonePlaying(false)
      clearTimeout(timeOutButt)
    }
    else{
      setFunc()
      setIsAnyonePlaying(true)
      await myPlayer(pianoPlayer, notes, index===0? props.composedSong.tempo : props.recommendations[index-1].tempo, setFunc)
    }
  }

  useEffect( async () => {
    ac = new window.AudioContext();
    pianoPlayer = await Soundfont.instrument(ac, 'acoustic_grand_piano', { soundfont: 'MusyngKite' });
  }, [])

  const downloadFunc = async (index) => {
    setIsDownloading(isDownloading.map((ele, ind)=>(
      (ind === index)? true: ele
    )))
    const songData = await downloadSongRequest(props.id, (index===0)?-1:index)
    setIsDownloading(isDownloading.map((ele, ind)=>(
      (ind === index)? false: ele
    )))
  }

  /***** Canvas render *****/
  const [ canvasRef, canvasWidth, canvasHeight, gridSize, nGrids, nPitch ] = useCanvas(true);

  const midi2Show = e => {
    return {
      start: Math.floor(e.start_tick/120),
      key: e.key - 20, // [myRef]
      gain: e.velocity/128,
      duration: Math.floor(e.duration/120)
    }
  }

  useEffect( async () => {
    if(myImg.length === 0){
      let newImageArray = [];
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      for(let i = 0; i < props.n_results+1; i++){
        let notes = (i===0)? props.composedSong.notes.map(midi2Show) : props.recommendations[i-1].notes.map(midi2Show);
        myDraw(canvasHeight, nGrids, nPitch, gridSize, notes, ctx);
        let img = canvas.toDataURL('image/png')
        newImageArray[i] = img;
      }

      setMyImg(newImageArray)
    }
  })

  return (
    <>
      <Canvas
        forwardedRef={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        unDisplay
        />  
      <Space direction='horizontal' split={<Divider type='vertical'/>}>
        <div id='play'>
          <button className='my-button1' onClick={()=>play(0)}
            style={{color: isAnyonePlaying&&!isPlaying[0]? 'grey' : isPlaying[0]? 'lightpink':'aquamarine'}}
            disabled={isAnyonePlaying&&!isPlaying[0]}>
            {isPlaying[0]?
              <PauseCircleFilled title="Pause"/> : 
              <PlayCircleFilled title="Play"/>}
          </button>
        </div>
        <div id='song-image'>
          <img src={`${myImg[0]}`}/>
        </div>
        <div id='like-status' className="my-button1" style={{color: props.likeStatus?'greenyellow':'red'}}>
          {props.likeStatus? <LikeFilled title='You liked it'/> : <DislikeFilled title='You disliked it'/>}
        </div>
        <div id="download">
          <button 
            className={(isDownloading[0]) ? "my-button1 button-move color1" : "my-button1 color1"} 
            onClick={() => downloadFunc(0)}
          >
            <DownloadOutlined title="Download My Song" />
          </button>
        </div>
      </Space>
      
      <div id='recommendation'>
        {props.recommendations.map((ele, ind)=>(
          <Space direction='horizontal' split={<Divider type='vertical'/>}>
            <div id='play'>
              <button className='my-button1' onClick={()=>play(ind+1)}
                style={{color: isAnyonePlaying&&!isPlaying[ind+1]? 'grey' : isPlaying[ind+1]? 'lightpink':'aquamarine'}}
                disabled={isAnyonePlaying&&!isPlaying[ind+1]}>
                {isPlaying[ind+1]?
                  <PauseCircleFilled title="Pause"/> : 
                  <PlayCircleFilled title="Play"/>}
              </button>
            </div>
            <div id='song-image'>
              <img src={`${myImg[ind+1]}`}/>
            </div>
            <div id='like-status' className="my-button1" style={{color: props.likeStatus?'greenyellow':'red'}}>
              {props.likeStatus? <LikeFilled title='You liked it'/> : <DislikeFilled title='You disliked it'/>}
            </div>
            <div id="download">
              <button 
                className={(isDownloading[ind+1]) ? "my-button1 button-move color1" : "my-button1 color1"} 
                onClick={() => downloadFunc(ind+1)}>
                <DownloadOutlined title="Download My Song" />
              </button>
            </div>
          </Space>
        ))}
      </div>
      <button className='my-button1' onClick={props.goback}>go back</button>
    </>
  );
}

export default RecPage;
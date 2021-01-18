import Soundfont from 'soundfont-player'
import './App.css'
import { useEffect, useRef, useState } from 'react';
import { 
  downloadSongRequest,
  rateSongRequest
} from './axios'
import { useCanvas, Canvas, myDraw } from './useCanvas.js';

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
  /***** Audio playing *****/
  const [isPlaying, setIsPlaying] = useState(new Array(props.n_results+1).fill(false))
  const [isAnyonePlaying, setIsAnyonePlaying] = useState(false)
  
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

  /***** Webserver request *****/
  const [isDownloading, setIsDownloading] = useState(new Array(props.n_results+1).fill(false))
  const [isLike, setIsLike] = useState(new Array(props.n_results).fill(false))
  const [isDisLike, setIsDisLike] = useState(new Array(props.n_results).fill(false))
  const [likeCount, setLikeCount] = useState(new Array(props.n_results).fill(0))
  const [disLikeCount, setDisLikeCount] = useState(new Array(props.n_results).fill(0))

  const downloadFunc = async (index) => {
    setIsDownloading(isDownloading.map((ele, ind)=>(
      (ind === index)? true: ele
    )))
    const songData = await downloadSongRequest(props.id, (index===0)?-1:index)
    setIsDownloading(isDownloading.map((ele, ind)=>(
      (ind === index)? false: ele
    )))
  }

  const pressLikeButt = async(ind, flag)=>{
    let deltaLike = 0, deltaDisLike = 0;
    if(flag){//press like button
      deltaLike = isLike[ind]? -1 : 1;
      deltaDisLike = isDisLike[ind]? -1 : 0;
      setIsLike(isLike.map((e, i)=>(i===ind? !e:e)))
      setIsDisLike(isDisLike.map((e, i)=>(i===ind? false:e)))
    }
    else{
      deltaLike = isLike[ind]? -1 : 0;
      deltaDisLike = isDisLike[ind]? -1 : 1;
      setIsDisLike(isDisLike.map((e, i)=>(i===ind? !e:e)))
      setIsLike(isLike.map((e, i)=>(i===ind? false:e)))
    }

    let result = await rateSongRequest(props.recommendations.composed_id, deltaLike, deltaDisLike)
    setLikeCount(likeCount.map((e, i)=>(i===ind? result.likes:e)))
    setDisLikeCount(disLikeCount.map((e, i)=>(i===ind? result.dislikes:e)))
  }

  /***** Canvas render *****/
  const [myImg, setMyImg] = useState([])
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
    <Space direction='vertical' size={'large'}>
      <Canvas
        forwardedRef={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        unDisplay
        />  
      <Space className='unit-container' direction='horizontal' split={<Divider type='vertical'/>}>
        <div id='play'>
          <button className='my-button1' onClick={()=>play(0)}
            style={{color: isAnyonePlaying&&!isPlaying[0]? 'grey' : isPlaying[0]? 'lightpink':'aquamarine'}}
            disabled={isAnyonePlaying&&!isPlaying[0]}>
            {isPlaying[0]?
              <PauseCircleFilled title="Pause"/> : 
              <PlayCircleFilled title="Play"/>}
          </button>
        </div>
        <div className='image-container' id='song-image'>
          <img src={`${myImg[0]}`}/>
        </div>
        <div id='like-status' className="my-button1" 
          style={{ width: '80px', color: props.likeStatus?'greenyellow':'red'}}>
          {props.likeStatus? <LikeFilled title='You liked it'/> : <DislikeFilled title='You disliked it'/>}
        </div>
        <div id="download">
          <button 
            className={(isDownloading[0]) ? "my-button1 button-move color1" : "my-button1 color1"} 
            onClick={() => downloadFunc(0)}
          >
            <DownloadOutlined title="Download my song" />
          </button>
        </div>
      </Space>
      
      <Space className='rec-page-down' direction='vertical'>
        {props.recommendations.map((ele, ind)=>(
          <Space className='unit-container' direction='horizontal' split={<Divider type='vertical'/>}>
            <div id='play'>
              <button className='my-button1' onClick={()=>play(ind+1)}
                style={{color: isAnyonePlaying&&!isPlaying[ind+1]? 'grey' : isPlaying[ind+1]? 'lightpink':'aquamarine'}}
                disabled={isAnyonePlaying&&!isPlaying[ind+1]}>
                {isPlaying[ind+1]?
                  <PauseCircleFilled title="Pause"/> : 
                  <PlayCircleFilled title="Play"/>}
              </button>
            </div>
            <div className='image-container' id='song-image'>
              <img src={`${myImg[ind+1]}`}/>
            </div>
            <Space style={{ width: '80px'}}>
              <button 
                className="my-button1 color3" 
                style={{color: isLike[ind]? 'azure' : 'grey'}}
                onClick={() => pressLikeButt(ind, true)}>
                {isLike[ind]? <LikeFilled title='Cancel Like'/> : <LikeOutlined title='Like'/>}
              </button>
              <button 
                className="my-button1 color3"
                style={{color: isDisLike[ind]? 'azure' : 'grey'}}
                onClick={() => pressLikeButt(ind, false)}>
                {isDisLike[ind]? <DislikeFilled title='Cancel Dislike'/> : <DislikeOutlined title='Dislike'/>}
              </button>
            </Space>
            <div id="download">
              <button 
                className={(isDownloading[ind+1]) ? "my-button1 button-move color1" : "my-button1 color1"} 
                onClick={() => downloadFunc(ind+1)}
                disabled={!(isLike[ind]||isDisLike[ind])}>
                <DownloadOutlined title={!(isLike[ind]||isDisLike[ind])?'Rate to download':"Download this song"} />
              </button>
            </div>
          </Space>
        ))}
      </Space>
      <button className='my-button1' onClick={props.goback}>go back</button>
    </Space>
  );
}

export default RecPage;
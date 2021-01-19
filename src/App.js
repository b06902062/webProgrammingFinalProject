import Soundfont from 'soundfont-player'
import './App.css'
import { useEffect, useRef, useState } from 'react';
import ButtonList from './buttonList.js'
import RecPage from './recommendationPage.js'
import { 
  getInitPiece, 
  composeRequest,
  downloadSongRequest,
  rateSongRequest,
  getRecommendationsRequest
} from './axios'
import { useCanvas, Canvas, myDraw } from './useCanvas.js';
import { useGridCanvas, GridCanvas } from './useGridCanvas.js';
import { useProgressCanvas, ProgressCanvas, progressDraw, stopProgress } from './useProgressCanvas.js';

import 'antd/dist/antd.css';
import {
  PlayCircleFilled,
  PauseCircleFilled,
  SlidersFilled,
  RedoOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
  DownloadOutlined,
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
  CommentOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Space, Divider, Typography, Spin } from 'antd';
// import { Button } from '@material-ui/core';
// import { ActionButton } from './customButtonStyle.js'
import { 
  PlayArrowRounded,
  StopRounded,
  ArrowBackRounded,
  MusicNoteRounded
} from '@material-ui/icons'

const { Title, Text } = Typography;


let ac, pianoPlayer, timeOutButt, timeOutButt2=[], timeOutButt3=[];
function App() {
  /***** Result Page *****/
  const [originPage, setOriginPage] = useState(true)
  const [recommendationPage, setRecommendationPage] = useState(false)
  const [recommandProps, setRecommendationProps] = useState()

  const nextPage = (flag)=>{
    console.log(flag)
    setOriginPage(flag)
  }

  const requestRecommendations = async()=>{
    let result = await getRecommendationsRequest(refId, composedId);
    console.log(result.n_results, result.composed_id, result.recommended_songs)
    setRecommendationProps(result)
    setRecommendationPage(true)
  }

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
      //for clock
      time: tick2Sec(e.start_tick),
      duration: tick2Sec(e.duration),
      
      key: e.key - 20, // [myRef]
      gain: e.velocity/128,
      //for draw
      start: Math.floor(e.start_tick/120),
      end: Math.floor(e.duration/120)
    }
  }

  const myPlayer = (player, notes, setFunc) => {
    return new Promise((resolve) => {
      const noteSched = notes.map(midi2Play)
      const noteProgress = notes.map(midi2Progress)
      const timeoutSec = 1000 * (noteSched[ noteSched.length - 1 ].time + noteSched[ noteSched.length - 1 ].duration);

      player.schedule(ac.currentTime, noteSched)
      progressDraw(noteProgress, timeOutButt2, timeOutButt3);
      
      timeOutButt = setTimeout(() => {
       setFunc(false)
       progressClear()
       resolve()
      }, timeoutSec)
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
        setFunc(false)

        clearTimeout(timeOutButt)
        timeOutButt2.forEach(e=>{clearTimeout(e)})
        timeOutButt3.forEach(e=>{clearTimeout(e)})
        progressClear()
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
  const [polyph, setPolyph] = useState([0, 0, 0, 0, 0, 0, 0, 0])
  const [rhythm, setRhythm] = useState([0, 0, 0, 0, 0, 0, 0, 0])
  const [composedPolyph, setComposedPolyph] = useState([0, 0, 0, 0, 0, 0, 0, 0])
  const [composedRhythm, setComposedRhythm] = useState([0, 0, 0, 0, 0, 0, 0, 0])
  const [defaultPR, setDefaultPR] = useState([])
  const [pLock, setPLock] = useState(true)
  const [rLock, setRLock] = useState(true)
  const [isLike, setIsLike] = useState(false)
  const [isDisLike, setIsDisLike] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [disLikeCount, setDisLikeCount] = useState(0)

  const pressLikeButt = async(flag)=>{
    let deltaLike = 0, deltaDisLike = 0;
    if(flag){//press like button
      deltaLike = isLike? -1 : 1;
      deltaDisLike = isDisLike? -1 : 0;
      setIsLike(!isLike)
      setIsDisLike(false)
    }
    else{
      deltaLike = isLike? -1 : 0;
      deltaDisLike = isDisLike? -1 : 1;
      setIsDisLike(!isDisLike)
      setIsLike(false)
    }
    //console.log(composedId, deltaLike, deltaDisLike)
    let result = await rateSongRequest(composedId, deltaLike, deltaDisLike)
    //console.log(result);
    setLikeCount(result.likes)
    setDisLikeCount(result.dislikes)
  }

  const defaultToggleFunc = () => {
    setPolyph(defaultPR[0])
    setRhythm(defaultPR[1])
  }

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
  const [hasRequested, setHasRequested] = useState(false)
  const [refId, setRefId] = useState(-1)
  const [composedId, setComposedId] = useState('');
  const [tempo, setTempo] = useState(120)
  const [isComposing, setIsComposing] = useState(false)
  const [hasComposed, setHasComposed] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect( async () => {
    if(!hasRequested){
      setHasRequested(true);
      ac = new window.AudioContext();
      pianoPlayer = await Soundfont.instrument(ac, 'acoustic_grand_piano', { soundfont: 'MusyngKite' });
      let initPiece = await getInitPiece();
      setTempo(initPiece.tempo);
      setRefId(initPiece.ref_id);
      setInitNotes(initPiece.notes);
      setPolyph(initPiece.attr_cls.polyph);
      setRhythm(initPiece.attr_cls.rhythm);
      setDefaultPR([initPiece.attr_cls.polyph, initPiece.attr_cls.rhythm])
    }
  }, [])

  const composeFunc = async () => {
    setIsComposing(true);
    let composedPiece = await composeRequest(
      refId, tempo, {
        polyph: polyph.map(e=>Math.max(Math.min(e, 7), 0)),
        rhythm: rhythm.map(e=>Math.max(Math.min(e, 7), 0))
      }
    );
    setComposedNotes(composedPiece.notes);
    setComposedRhythm(composedPiece.rhythm);
    setComposedPolyph(composedPiece.polyph);
    setComposedId(composedPiece.composed_id);
    setIsComposing(false);
    setHasComposed(true);
  }

  const downloadFunc = async (composed_id, ranking) => {
    // console.log('[ranking]', ranking)
    setIsDownloading(true)
    const songData = await downloadSongRequest(composed_id, ranking);
    setIsDownloading(false)
  }

  /***** Canvas render *****/
  const [ canvasRef, canvasWidth, canvasHeight, gridSize, nGrids, nPitch, n_bars, n_grids_per_bar, window_width, window_height] = useCanvas();
  const [ gridCanvasRef ] = useGridCanvas(recommendationPage);
  const [ progressCanvasRef, progressDraw, progressClear] = useProgressCanvas();

  const midi2Show = e => {
    return {
      start: Math.floor(e.start_tick/120),
      key: e.key - 20, // [myRef]
      gain: e.velocity/128,
      duration: Math.floor(e.duration/120)
    }
  }

  useEffect( async () => {
    if(originPage){
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let notes = initNotes.map(midi2Show);
      myDraw(canvasHeight, nGrids, nPitch, gridSize, notes, ctx);
    }
    else if(!recommendationPage){
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let notes = composedNotes.map(midi2Show);
      myDraw(canvasHeight, nGrids, nPitch, gridSize, notes, ctx);
    }
  }, [initNotes, canvasHeight, canvasWidth, originPage])

  const passedRhythm = (originPage)? rhythm : composedRhythm;
  const passedPolyph = (originPage)? polyph : composedPolyph;
  
  return (
    <div className="App">
      <body className="App-header">
        {recommendationPage?
          <RecPage 
            id={recommandProps.composed_id}
            recommendations={recommandProps.recommended_songs}
            composedSong={{
              tempo:tempo, notes:composedNotes, composed_id:recommandProps.composed_id,
              dislikes:disLikeCount, likes:likeCount, downloads:0, ranking:-1
            }}
            n_results={recommandProps.n_results}
            goback={()=>setRecommendationPage(false)}
            likeStatus={isLike}
          />
          :
          <>
            <div style={{position: "relative", width:window_width, height:(canvasHeight+0.1*window_height)}}>
              {originPage?
                <div id="info-container" style={{overflow:'hidden', width:0.8 * (window_width - canvasWidth), height:canvasHeight}}>
                  <Title strong level={3} style={{color:'CornflowerBlue'}}>Original Song</Title>
                  <Title strong underline level={5} style={{color:'DarkCyan'}}>ID:&nbsp;{refId}</Title>
                  <div id="play">
                    <button className="my-button1" style={{color: isPlayingInit? 'lightpink':'aquamarine'}} 
                      onClick={playButton("i")} disabled={refId===-1}>
                      {isPlayingInit? 
                      <PauseCircleFilled title="Pause"/> : 
                      <PlayCircleFilled title="Play"/>}
                      </button>
                    </div>
                  <div id="back2default">
                    <button className="my-button1 color3" onClick={defaultToggleFunc}>
                      <RedoOutlined title="Set Tuners to Default"/>
                      </button>
                    </div>
                  <div id="request">
                      <button 
                        className={isComposing ? "my-button1 color1 spinner" : "my-button1 color1"}
                        onClick={composeFunc} 
                        disabled={isComposing}
                      >
                        {/* <SlidersFilled title={hasComposed? "Recompose":"Compose"}/>  */}
                        <MusicNoteRounded style={{fontSize: '36px'}} titleAccess={isComposing? "Composing..." : hasComposed? "Recompose" : "Compose"}/>
                      </button>
                  </div>
                  { hasComposed && !isComposing &&
                    <div id="nextpage">
                      <button className="my-button1 color2"
                        onClick={()=>nextPage(false)}
                        disabled={isPlayingInit}>
                        <ArrowRightOutlined title="See My Song"/>
                      </button>
                    </div>
                  }
                </div>
                :
                <div id="info-container" style={{overflow:'hidden', width:0.8 * (window_width - canvasWidth), height:canvasHeight}}>
                  <Title strong level={3} style={{color:'CornflowerBlue'}}>Your Song</Title>
                  <Title strong underline level={5} style={{color:'DarkCyan'}}>ID:&nbsp;{refId}</Title>
                  <div id="play">
                    <button className="my-button1" style={{color: isPlayingComposed? 'lightpink':'aquamarine'}} onClick={playButton("c")}>
                      {(isPlayingComposed)? 
                      <PauseCircleFilled title="Pause"/> : 
                      <PlayCircleFilled title="Play"/>}
                    </button>
                  </div>
                  <Space>
                    <button 
                      className="my-button1 color3" 
                      style={{color: isLike? 'greenyellow' : 'grey'}}
                      onClick={() => pressLikeButt(true)}>
                      {isLike? <LikeFilled title='Cancel Like'/> : <LikeOutlined title='Like'/>}
                    </button>
                    <button 
                      className="my-button1 color3"
                      style={{color: isDisLike? 'red' : 'grey'}}
                      onClick={() => pressLikeButt(false)}>
                      {isDisLike? <DislikeFilled title='Cancel Dislike'/> : <DislikeOutlined title='Dislike'/>}
                    </button>
                  </Space>
                  <div id="recommand">
                    <button 
                      className="my-button1 color1"
                      onClick={() => requestRecommendations()}
                      disabled={!(isLike||isDisLike)}>
                      <StarFilled title={(isLike||isDisLike)?"Recommendations":"Like or dislike to get recommendations :)"}/>
                    </button>
                  </div>
                  {/* <div id="download">
                    <button 
                      className={(isDownloading) ? "my-button1 button-move color1" : "my-button1 color1"} 
                      onClick={() => downloadFunc(composedId, -1)}
                    >
                      <DownloadOutlined title="Download My Song" />
                    </button>
                  </div> */}
                  <div id="prevpage">
                    <button 
                      className="my-button1 color2"
                      onClick={()=>nextPage(true)}
                      disabled={isDownloading || isPlayingComposed}
                    >
                      <ArrowLeftOutlined title="See Original Song"/>
                    </button>
                  </div>
                </div>           
              }
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
            <Space direction='vertical' style={{width:window_width}}>
              <ButtonList 
                toggleFunc={toggleFunc} lockFunc={rLockFunc} 
                locked={rLock} attrData={passedRhythm}
                windowWidth={window_width} canvasWidth={canvasWidth}
                nowAPage={originPage}
                attrType="rhythm"/>
              <ButtonList 
                toggleFunc={toggleFunc} lockFunc={pLockFunc}
                locked={pLock} attrData={passedPolyph}
                windowWidth={window_width} canvasWidth={canvasWidth}
                nowAPage={originPage}
                attrType="polyph"/>
            </Space>
          </>
        }
      </body>
    </div>
  );
}

export default App;
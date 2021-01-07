import Soundfont from 'soundfont-player'
import PianoRoll from 'react-piano-roll'
import './App.css'
import { useEffect, useRef, useState } from 'react';
import ButtonList from './buttonList.js'
import { getInitPiece, composeRequest } from './axios'

let ac, pianoPlayer, timeOutButt;

/***** Backend Inf Display *****/
const midiDispaly = e => {
  return ["0:0:0", e.key, 1]
  //"bars:quarters:sixteenths", key, 1 for whole note/"4n" for quarter note
}

function App() {
  /***** Audio Playing *****/
  const [initNotes, setInitNotes] = useState([])
  const [initPianoroll, setInitPianoroll] = useState('')
  const [composedNotes, setComposedNotes] = useState([])
  const [composedPianoroll, setComposedPianoroll] = useState('')
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

  const myPlayer = (player, notes, setFunc) => {
    return new Promise((resolve) => {
      const noteSched = notes.map(midi2Play)
      const timeoutSec = 1000 * (noteSched[ noteSched.length - 1 ].time + noteSched[ noteSched.length - 1 ].duration);
      player.schedule(ac.currentTime, noteSched)
      timeOutButt = setTimeout(() => {
        setFunc(false)
        resolve()
      }, timeoutSec)
    })
  }

  const playButton = (tag) => {
    return async() => {
      let isPlaying = (tag === "i")? isPlayingInit : isPlayingComposed
      let notes = (tag === "i")? initNotes : composedNotes
      let setFunc = (tag === "i")?
        ele => {setIsPlayingInit(ele)} :
        ele => {setIsPlayingComposed(ele)}
      if(!isPlaying){
        setFunc(true)
        await myPlayer(pianoPlayer, notes, setFunc)
      }
      else{
        setFunc(false)
        pianoPlayer.stop()
        clearTimeout(timeOutButt)
      }
    }
  }

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
    setInitPianoroll(initPiece.pianoroll_base64);
    console.log(initPiece.pianoroll_base64)
    console.log(initPianoroll)
  }, [])

  const composeFunc = async () => {
    setIsComposing(true);
    setHasComposed(false);
    let composedPiece = await composeRequest(
      refId, tempo, {
        polyph: polyph.map(ele => Math.max(Math.min(ele, 7), 0)),
        rhythm: rhythm.map(ele => Math.max(Math.min(ele, 7), 0))
      }
    );
    setComposedNotes(composedPiece.notes);
    setComposedPianoroll(composedPiece.pianoroll_base64);
    setIsComposing(false);
    setHasComposed(true);
  }
  
  return (
    <div className="App">
      <header className="App-header">
        {/* <PianoRoll
            ref={pianorollRef}
            width={640}
            height={360}
            zoom={4}
            resolution={1}
            noteData={[
              ["0:0:0", "G5", ""],
              ["0:0:0", "C4", "2n"],
              ["2:4:0", "C4", 1],
              ["0:0:0", "D4", "2n"],
              ["0:0:0", "E4", "2n"],
              ["0:2:0", "B4", "4n"],
              ["1:2:0", "B4", "4n"],
              ["0:3:0", "A#4", "4n"],
              ["0:0:0", "G3", ""],
            ]}
          />         */}
        {/* <canvas width="600" height="200"></canvas> */}
        <img
          className="pypianoroll"
          src={"data:image/jpg;base64," + initPianoroll} 
          style={{display: (initPianoroll === '')? 'none' : 'initial'}}
        />
        <div id="play">
          <button onClick={playButton("i")}>
            {isPlayingInit? "Stop" : "Play Init Music"}
          </button>
        </div>
        <ButtonList 
          toggleFunc={toggleFunc} lockFunc={rLockFunc} 
          locked={rLock} attrData={rhythm}
          attrType="rhythm"/>
        <ButtonList 
          toggleFunc={toggleFunc} lockFunc={pLockFunc}
          locked={pLock} attrData={polyph}
          attrType="polyph"/>
        <div id="request">
          <button onClick={composeFunc} disabled={isComposing}>
            {hasComposed? "Recompose":"Compose"}
          </button>
        </div>
        <img
          className="pypianoroll"
          src={"data:image/jpg;base64," + composedPianoroll} 
          style={{display: (composedPianoroll === '')? 'none' : 'initial'}}
        />
        <div id="playComposed">
          <button onClick={playButton("c")} disabled={!hasComposed}>
            {isPlayingComposed? "Stop" : "Play Composed Music"}
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
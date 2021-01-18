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

let ac, pianoPlayer, timeOutButt, timeOutButt2=[], timeOutButt3=[];
function RecPage(props) {
  const [isPlaying, setIsPlaying] = useState([])
  

  const play = ()=>{
    
  }
  return (
    <>
      <div>
        {props.id}
        <div>
          <button class='my-button1' onClick={()=>play(0)}>go back</button>
          <button class='my-button1' onClick={props.goback}>go back</button>
        </div>
      </div>
      <div>
        {
          props.n_results===0?
            <div>no related recommand</div>
            :
            props.songs.map(elem=>{
              <div>{123}</div>
            })
        }
      </div>  
    </>
  );
}

export default RecPage;
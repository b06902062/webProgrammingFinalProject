import './App.css'
import { useEffect, useRef, useState } from 'react';

function ButtonList(props){

  return(
    <div className="button-list">
      {props.attrType}
      {props.attrData.map((elem, index) => (
        <div key={`${props.attrType[0]}_${index}`}>
          <input 
            type="checkbox"
            defaultChecked={props.locked} 
            onClick={props.lockFunc}
            style={{visibility: (index === 0)? 'visible' : 'hidden'}}>
          </input>
          <button 
            onClick={props.toggleFunc(index, -1, props.attrType)}
            disabled={(elem <= 0) || (props.locked && index !== 0)}>
            -
          </button>
          {Math.max(Math.min(elem, 7), 0)}
          <button 
            onClick={props.toggleFunc(index, +1, props.attrType)}
            disabled={(elem >= 7) || (props.locked && index !== 0)}>
            +
          </button>
        </div>
      ))}
    </div>   
  )
}

export default ButtonList
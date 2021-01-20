import 'antd/dist/antd.css';
import { Button, Switch, Typography, Space, Divider } from 'antd';
import {
  UnlockOutlined,
  LockOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
const { Text } = Typography;

function ButtonList(props){
  return(
    <div style={{display:'flex'}}>
        <div style={{ width: 0.8*(props.windowWidth-props.canvasWidth) }}>
          <Switch
            size="small"
            checkedChildren={<UnlockOutlined />}
            unCheckedChildren={<LockOutlined />}
            defaultChecked={props.locked} 
            onClick={props.lockFunc}
            disabled={(!props.nowAPage)}/>
          {props.attrType === 'rhythm'?
            <Text keyboard strong 
              style={{ fontSize:props.buttonSize, color:'mediumvioletred'}}
              editable={{editing:false, tooltip:'Controls the "intensity" of rhythm in each bar', icon:<QuestionCircleOutlined />}}>
              &nbsp;Rhythm </Text>
            :
            <Text keyboard strong 
              style={{ fontSize:props.buttonSize, color:'MediumSeaGreen'}}
              editable={{editing:false, tooltip:'Controls the "fullness" of harmony in each bar', icon:<QuestionCircleOutlined />}}>
              &nbsp;Polyph </Text>
            }
        </div>
        <div className="button-list" style={{ width: props.canvasWidth}}>
          {props.attrData.map((elem, index) => (
            <div key={`${props.attrType[0]}_${index}`}>
              <button 
                className="my-button2" style={{fontSize:props.buttonSize}}
                onClick={props.toggleFunc(index, -1, props.attrType)}
                disabled={(!props.nowAPage) || (elem <= 0) || (props.locked && index !== 0)}>
                  <LeftCircleOutlined title="Down"/>
              </button>
              <Text strong code style={{fontSize:props.buttonSize}}
                type={
                  elem>5?
                    "danger":elem<2?
                      "success":"warning"
                }
              >{Math.max(Math.min(elem, 7), 0)}</Text>
              <button
                className="my-button2" style={{fontSize:props.buttonSize}}
                onClick={props.toggleFunc(index, +1, props.attrType)}
                disabled={(!props.nowAPage) || (elem >= 7) || (props.locked && index !== 0)}>
                  <RightCircleOutlined title="Up"/>
              </button>
            </div>
          ))}
        </div>
    </div>   
  )
}

export default ButtonList
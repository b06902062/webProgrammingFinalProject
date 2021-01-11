import 'antd/dist/antd.css';
import { Switch, Typography } from 'antd';
import {
  UnlockOutlined,
  LockOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
} from '@ant-design/icons';
const { Text, Link } = Typography;

function ButtonList(props){

  return(
    <div className="button-list">
      {props.attrData.map((elem, index) => (
        <div key={`${props.attrType[0]}_${index}`}>
          {(index === 0)? 
            <>
              <Switch
                checkedChildren={<UnlockOutlined />}
                unCheckedChildren={<LockOutlined />}
                defaultChecked={props.locked} 
                onClick={props.lockFunc}
                style={{visibility: (index === 0)? 'visible' : 'hidden'}}/>
              <Text keyboard strong>{props.attrType}</Text>
            </>
             :
            <div/>}
          <button 
            className="my-button2"
            onClick={props.toggleFunc(index, -1, props.attrType)}
            disabled={(elem <= 0) || (props.locked && index !== 0)}>
              <LeftCircleOutlined title="Down"/>
          </button>
          <Text strong code
            type={
              elem>5?
                "danger":elem<2?
                  "success":"warning"
            }
          >{Math.max(Math.min(elem, 7), 0)}</Text>
          <button
            className="my-button2"
            onClick={props.toggleFunc(index, +1, props.attrType)}
            disabled={(elem >= 7) || (props.locked && index !== 0)}>
              <RightCircleOutlined title="Up"/>
          </button>
        </div>
      ))}
    </div>   
  )
}

export default ButtonList
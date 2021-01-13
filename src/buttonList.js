import 'antd/dist/antd.css';
import { Button, Switch, Typography, Space, Divider } from 'antd';
import {
  RedoOutlined,
  UnlockOutlined,
  LockOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
} from '@ant-design/icons';
const { Text } = Typography;

function ButtonList(props){
  if(props.attrType==='title'){
    const arr = ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8'];
    return(
      <div>
        <Space split={<Divider type="vertical"/>}>
          <Space direction="horizontal" style={{ width: 120 }}>
            <Button 
              type="primary" shape="round" size='small'
              icon={<RedoOutlined />} onClick={props.toggleFunc} />
            <Text keyboard strong style={{color:'palegreen'}}>Bar</Text>
            </Space>
          {arr.map((elem, index) => (
            <div key={`bar_${elem}`}>
              <button 
                className="my-button4"
                disabled={true}>
                  <LeftCircleOutlined/>
              </button>
              <Text strong code style={{color:'palegreen'}}>{index}</Text>
              <button
                className="my-button4"
                disabled={true}>
                  <RightCircleOutlined/>
              </button>
            </div>
          ))}
        </Space>
      </div>
    )
  }

  return(
    <div className="button-list">
      <Space split={<Divider type="vertical"/>}>
        <Space direction="horizontal" style={{ width: 120 }}>
          <Switch
            size="small"
            checkedChildren={<UnlockOutlined />}
            unCheckedChildren={<LockOutlined />}
            defaultChecked={props.locked} 
            onClick={props.lockFunc}/>
          {props.attrType === 'rhythm'?
            <Text keyboard strong style={{color:'mediumslateblue'}}>Rhythm</Text> :
            <Text keyboard strong style={{color:'MediumSeaGreen'}}>Polyph</Text> }
        </Space>
        {props.attrData.map((elem, index) => (
          <div key={`${props.attrType[0]}_${index}`}>
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
      </Space>
      
    </div>   
  )
}

export default ButtonList
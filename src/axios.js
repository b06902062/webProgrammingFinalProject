import axios from 'axios'

const instance = axios.create({ baseURL: 'https://musicai.citi.sinica.edu.tw/museoptimus_api' })

const statusApi = async () => {
  const response = await instance.get('/');
  console.log('[status api] response:', response);
  return
}

const getInitPiece = async () => {
  const {
    data: {attr_cls, notes, tempo, ref_id}
  } = await instance.get('/get_init_sample');
  return {attr_cls, notes, tempo, ref_id}
}

const composeRequest = async (ref_id, oldTempo, {polyph, rhythm}) => {
  const {
    data: {compose_time, notes, tempo}
  } = await instance.post('/compose', {
    ref_id: ref_id,
    tempo: oldTempo,
    attr_cls: {
      polyph: polyph,
      rhythm: rhythm
    }
  });
  return {compose_time, notes, tempo}
}

// const startGame = async () => {
//   const {
//     data: { msg }
//   } = await instance.post('/start')

//   return msg
// }

// const guess = async (number) => {
//   const {
//     data: { msg }
//   } = await instance.get('/guess', { params: { number } })

//   return msg
// }

// const restart = async () => {
//   const {
//     data: { msg }
//   } = await instance.post('/restart')

//   return msg
// }

export { statusApi, getInitPiece, composeRequest }

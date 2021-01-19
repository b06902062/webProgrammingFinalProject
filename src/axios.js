import axios from 'axios'

const instance = axios.create({ baseURL: 'https://musicai.citi.sinica.edu.tw/museoptimus_api' })

const statusApi = async () => {
  const response = await instance.get('/');
  console.log('[status api] response:', response);
  return
}

const getInitPiece = async (requestId) => {
  const {
    data: {attr_cls, notes, tempo, ref_id}
  } = (requestId < 0) || (requestId > 99)? 
    await instance.get('/get_init_sample') :
    await instance.post('/get_init_sample', {
      ref_id: requestId
    })
  return {attr_cls, notes, tempo, ref_id}
}

const composeRequest = async (ref_id, oldTempo, {polyph, rhythm}) => {
  const {
    data: {compose_time, notes, tempo, composed_id}
  } = await instance.post('/compose', {
    ref_id: ref_id,
    tempo: oldTempo,
    attr_cls: {
      polyph: polyph,
      rhythm: rhythm
    }
  });
  return {compose_time, notes, tempo, rhythm, polyph, composed_id}
}

const rateSongRequest = async (composedID, delta_like, delta_dislike) => {
  const {
    data: {composed_id, likes, dislikes}
  } = await instance.post('/rate', {
    composed_id: composedID,
    delta_like: delta_like,
    delta_dislike: delta_dislike
  });

  return {composed_id, likes, dislikes}
}

const getRecommendationsRequest = async (ref_id, composed_id) => {
  const {
    data: {n_results, recommended_songs}
  } = await instance.post('/retrieve', {
    ref_id: ref_id,
    composed_id: composed_id
  });

  return {n_results, composed_id, recommended_songs}
}

const downloadSongRequest = async (composed_id, ranking) => {
  //console.log('in download request, id = ', composed_id, 'ranking = ', ranking)
  const { data } = await instance.post('/download', {
    composed_id: composed_id,
    ranking: ranking
  }, {
    responseType: 'blob'
  })

  if (ranking === 0) {
    ranking = 'my_song'
  }
  else{
    ranking = `recommendation_${ranking}`
  }

  const downloadUrl = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', String(ranking) + '.mp3');
  document.body.appendChild(link);
  link.click();
  link.remove();

  return data
}

export { statusApi, getInitPiece, composeRequest, rateSongRequest, getRecommendationsRequest, downloadSongRequest }

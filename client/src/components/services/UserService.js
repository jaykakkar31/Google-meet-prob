import axios from "axios";
const url='http://localhost:9000'
export async function saveCallId(payload) {
  const response = axios({
    method: "post",
    url: `${url}/api/save-call-id`,
    data:{id:payload.id,signalData:payload.signalData}
  });

  return await response;
}


export async function getCallId(id) {
  return await axios.get(`${url}/api/get-call-id/${id}`);
}

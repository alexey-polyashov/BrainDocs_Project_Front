import axios from "axios";

const url = 'http://localhost:3003/braindocs/api/v1'

export default axios.create({
  baseURL: url,
  timeout: 5000,
})

import axios from "axios";

const url = 'https://brain-docs.herokuapp.com/api/v1'
const urlLocal = 'http://localhost:8181/braindocs/api/v1'

export default axios.create({
  baseURL: url,
  timeout: 10000,
})

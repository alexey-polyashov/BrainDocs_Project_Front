import axios from "axios";

const url = 'https://brain-docs.herokuapp.com'
const context = '/api/v1'

export default axios.create({
  baseURL: context,
  timeout: 2000,
})

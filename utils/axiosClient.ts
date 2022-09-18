import axios from 'axios'

export const client = async (baseURL: string) => axios.create({
  baseURL,
  maxRedirects: 0,
  validateStatus(status: number){
    return status >= 200 && status <= 302
  },
})

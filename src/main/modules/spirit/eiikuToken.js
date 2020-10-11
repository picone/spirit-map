import store from '../../../renderer/store'
import request from 'request'
import crypto from 'crypto'

const URL_GENERATE_TOKEN = 'https://leida.eiiku.com/tokenkey.php'
const URL_GET_TOKEN = 'https://leida.eiiku.com/data.php'

export function getToken (error, success) {
  let cookieJar = request.jar()
  cookieJar.setCookie(request.cookie(`user=${store.state.Spirit.eiiku_user}`), URL_GENERATE_TOKEN)
  cookieJar.setCookie(request.cookie(`HYBBS_HEX=${store.state.Spirit.eiiku_token}`), URL_GENERATE_TOKEN)
  request(URL_GENERATE_TOKEN, {jar: cookieJar, timeout: 5000}, (err) => {
    if (err != null) {
      error(err)
    } else {
      request(URL_GET_TOKEN, {jar: cookieJar, timeout: 5000}, (err, res, body) => {
        if (err != null) {
          error(err)
        } else {
          let decipher = crypto.createDecipheriv('aes-128-ecb', Buffer.from('maxReconnectTime', 'utf-8'), '')
          decipher.setAutoPadding()
          let result = decipher.update(Buffer.from(body, 'base64')).toString('utf-8')
          result += decipher.final().toString('utf-8')
          let data = JSON.parse(result)
          success(data.data)
        }
      })
    }
  })
}

import config from '../config/config.js'
import axios from 'axios'

function login (username, password) {
  return new Promise(function (resolve, reject) {
    var user = { 'username': username, 'password': password }
    axios.post(config.apiEndpoint + '/auth', user)
      .then((response1) => {
        axios.get(config.apiEndpoint + '/auth/', {headers: { Authorization: `Bearer ${response1.data.token}` }})
          .then((response2) => {
            var userData = Object.assign(response1.data, response2.data.claims)
            window.localStorage.setItem('smarthomeUser', JSON.stringify(userData))
            resolve(userData)
          })
          .catch((err) => {
            reject(err.response2.data)
          })
      })
      .catch((err) => {
        reject(err.response2.data)
      })
  })
}

// eslint-disable-next-line
function renewToken (token) {
  return new Promise(function (resolve, reject) {
    axios.put(config.apiEndpoint + '/auth', {headers: { Authorization: `Bearer ${token}` }})
      .then(function (res) {
        window.localStorage.setItem('smarthomeUser', JSON.stringify(res.data))
        resolve(res.data)
      })
      .catch(function (err) {
        reject(err.response.data)
      })
  })
}

function checkAuth () {
  var token = getAuthToken()
  if (token != null) {
    var tokenExpiration = new Date(token.expire)
    if (tokenExpiration < Date.now()) {
      // Token is expired
      window.localStorage.removeItem('smarthomeUser')
      return false
    } else {
      return true
    }
  }
  return false
}

function getAuthToken () {
  var token = window.localStorage.getItem('smarthomeUser')
  if (token != null) {
    return JSON.parse(token)
  } else {
    return null
  }
}

export { login, checkAuth }
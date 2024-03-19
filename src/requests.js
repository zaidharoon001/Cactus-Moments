import { OFFLINE, baseURL } from './constants'

export const req = async (method, endpoint, body=null, onError=()=>{}, onSuccess=()=>{}) => {
    try {
		console.log("url", `${baseURL}${endpoint}`)
        const res = await fetch(`${baseURL}${endpoint}`, {
            method, 
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: body ? JSON.stringify(body) : null
        })
        const data = await res.json()
        if(!data.success) onError(data?.message)
        else onSuccess(data.data)
        return data.data
    } catch(err) {
        onError(typeof err == "string" ? err : err.message)
        console.log(err)
    }
}

const refresh = async () => {
    const refreshToken = localStorage.getItem('kawan_refreshToken')
    if(!refreshToken) throw 'No Refresh Token Found'
    const data = await req('POST', `/user/refresh/${refreshToken}`, {
        device: {
            id: 'web',
            deviceToken: 'MockToken'
        }
    })
    console.log("Refresh Token", data)
    if(data.refreshToken) localStorage.setItem('kawan_refreshToken', data.refreshToken)
    localStorage.setItem('kawan_accessToken', data.accessToken)
    return data.accessToken
}

export const authReq = async (method, endpoint, body=null, count=0) => {
    try {
        const res = await fetch(`${baseURL}${endpoint}`, {
            method, 
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('kawan_accessToken')
            },
            body: body ? JSON.stringify(body) : undefined
        })
        const data = await res.json()
        // if((data.message == "jwt expired" || data.message == "jwt malformed") && count < 2) {
        //     console.log("Attempting Refresh")
        //     await refresh()
        //     return await authReq(method, endpoint, body, count+1)
        // }
        return data.data
    } catch(err) {
        console.log("Hi!Hi!")
        // if(count < 2) {
        //     console.log("Attempting Refresh")
        //     await refresh()
        //     return await authReq(method, endpoint, body, count+1)
        // }
        console.log(err)
    }
}

export function getKey(key) {
    const value = localStorage.getItem(key)
    return JSON.parse(value == "{}" ? "[]" : (value ?? null))
}

export function setKey(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

export function delKey(key) {
	localStorage.removeItem(key)
}

let country = null
fetch('https://ipinfo.io/?token=dcba4035a2dc73').then(res => res.json()).then(data => country = data.country)
export function getCountry() {
	return country
}

export const getSmallImage = (url, resize='100') => OFFLINE ? `${url}&size=100` : `https://d1mq3916k6dmt.cloudfront.net/nwOr3tB7UZjp41oQl1eKXbY09VRFJHyz_SujluRquOg/rs:fit:${resize}:${resize}:0/g:no/${btoa(url).replace("=", "").replace('/', '_').replace('+', '-')}.png`
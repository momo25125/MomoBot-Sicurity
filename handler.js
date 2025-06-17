// handler-SECU_NO_WELCOME.js
import { generateWAMessageFromContent } from "@whiskeysockets/baileys"
import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import fs from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return
        m.exp = 0
        m.limit = false

        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object') global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.messaggi)) user.messaggi = 0
                if (!isNumber(user.blasphemy)) user.blasphemy = 0
                if (!isNumber(user.msg)) user.msg = {}
                if (!isNumber(user.exp)) user.exp = 0
                if (!isNumber(user.money)) user.money = 0 
                if (!isNumber(user.warn)) user.warn = 0
                if (!isNumber(user.joincount)) user.joincount = 2   
                if (!isNumber(user.limit)) user.limit = 20
                if (!('premium' in user)) user.premium = false
                if (!isNumber(user.premiumDate)) user.premiumDate = -1
                if (!isNumber(user.tprem)) user.tprem = 0
                if (!user.premium) user.premium = false
                if (!user.premium) user.premiumTime = 0
                if (!('name' in user)) user.name = m.name
                if (!('muto' in user)) user.muto = false
            } else global.db.data.users[m.sender] = { messaggi: 0 }

            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat)) chat.isBanned = false
                if (!('detect' in chat)) chat.detect = true
                if (!('delete' in chat)) chat.delete = false
                if (!('gpt' in chat)) chat.gpt = false
                if (!('bestemmiometro' in chat)) chat.bestemmiometro = true
                if (!('antielimina' in chat)) chat.antielimina = false
                if (!('antiLink' in chat)) chat.antiLink = true
                if (!('antiinsta' in chat)) chat.antiinsta = false
                if (!('antitiktok' in chat)) chat.antitiktok = false
                if (!('antiLink2' in chat)) chat.antiLink2 = false
                if (!('antiviewonce' in chat)) chat.antiviewonce = false
                if (!('antiTraba' in chat)) chat.antiTraba = true
                if (!('antiArab' in chat)) chat.antiArab = true
                if (!('modoadmin' in chat)) chat.modoadmin = false
                if (!('antiporno' in chat)) chat.antiporno = true
                if (!isNumber(chat.expired)) chat.expired = 0
                if (!isNumber(chat.messaggi)) chat.messaggi = 0
                if (!isNumber(chat.blasphemy)) chat.blasphemy = 0
                if (!('name' in chat)) chat.name = this.getName(m.chat)
                if (!('antivirus' in chat)) chat.antivirus = false
            }

            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = false
                if (!('restrict' in settings)) settings.restrict = true
                if (!('antiCall' in settings)) settings.antiCall = false
                if (!('antiPrivate' in settings)) settings.antiprivato = false
                if (!('jadibot' in settings)) settings.jadibot = true   
            }
        } catch (e) {
            console.error(e)
        }

        if (opts['nyimak']) return
        if (!m.fromMe && opts['self']) return
        if (opts['pconly'] && m.chat.endsWith('g.us')) return
        if (opts['gconly'] && !m.chat.endsWith('g.us')) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || isOwner || isMods || global.db.data.users[m.sender].premiumTime > 0

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)

        // Plugin handling rimane invariato...
        // Non incluso qui per lunghezza, ma è lo stesso codice originale, tagliato per mostrare solo le modifiche

    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }
        // Resto del codice invariato (muto, print, autoread)
    }
}

// Funzioni inutili rimosse: participantsUpdate
// Rimane: groupsUpdate, callUpdate, deleteUpdate

// Gruppi Update, Call Update, Delete Update restano invariati salvo welcome già rimossi

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})
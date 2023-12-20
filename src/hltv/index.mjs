import 'dotenv/config'
import puppeteer from "puppeteer";
import { Client, Events, GatewayIntentBits, ThreadAutoArchiveDuration } from "discord.js";
import { newsChannelId } from '../config.mjs';

const BASE_URL = 'https://www.hltv.org'

const hltvClient = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
]})
// NOTE - business logic -> Only search for the day news. Then wait for full 24 hours and repeat

//const news = await HLTV.getNews()
//  console.log(news)

hltvClient.on(Events.ClientReady, async function (client) {
  console.log(`Logged as ${client.user.id}`)
  const channel = client.channels.cache.get(newsChannelId);

  if (!channel) {
    console.error(`Channel with ID ${newsChannelId} not found.`)

    return
  }

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  })

  const page = await browser.newPage()

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })

  const todaysHeaderSelector = '.standard-list'
  const todayNews = await page.evaluate((selector) => {
    const newsLines = Array.from(document.querySelector(selector).children)
    const newsLinesInfo = newsLines.map(newsLine => {
      return { 
        title: newsLine.querySelector('.newstext').textContent,
        link: newsLine.getAttribute('href') 
      } 
    })

    return newsLinesInfo
  }, todaysHeaderSelector)

  console.log('NEWS COLLECTED:', todayNews)

  try {
    for (const news of todayNews) {
      if (!news.link || !news.title) {
        continue
      }
  
      await page.goto(`${BASE_URL}${news.link}`);
      
      const thread = await postNewsThread(news, channel)
      console.log('CREATED THREAD: ', thread)

      await page.goBack()
    }
  } catch (error) {
    console.error(error);
  }
  
  await browser.close()
})

hltvClient.login(process.env.HLTV_BOT_SECRET)

/** 
 * @param { import('./hltvActions').HLTVNews } news 
 * @param { Channel } channel
 */
export async function postNewsThread(news, channel) {
  console.log(news.title)
  const thread = await channel.threads.create({
    name: news.title,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
    reason: 'news',
  })

  return thread.name
}

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
hltvClient.on(Events.ClientReady, async function (client) {
  console.log(`Logged as ${client.user.id}`)
  const channel = client.channels.cache.get(newsChannelId);

  if (!channel) {
    console.error(`Channel with ID ${newsChannelId} not found.`)

    return
  }

  let browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  })
  let page = await browser.newPage()

  console.log('PUPPETEER BROWSER INSTANTIATED')

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

  for (const news of todayNews) {
    if (!news.link || !news.title) {
      console.error('Something went wrong with some of the news so it\'ll be skipped')

      continue
    }

    // NOTE - Restantiate browser for every page
    await browser.close()
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    })
    page = await browser.newPage()

    console.log('GOTO PAGE: ', news.link)
    await page.goto(`${BASE_URL}${news.link}`);

    const contentSelector = '.newstext-con'
    const content = await page.evaluate((selector) => {
      const contentBlocks = Array.from(document.querySelectorAll(selector))

      return contentBlocks.map(
        (content) => 
          content.textContent
            .replace(/\s+/g, ' ')
            .trim()
      )
    }, contentSelector)

    console.log(content)
    const thread = await postNewsThread(news, channel)
    console.log('CREATED THREAD: ', thread)

    console.log('GOING BACK TO HOME PAGE')
    await page.goBack()
  }

  await browser.close()
})

hltvClient.login(process.env.HLTV_BOT_SECRET)

/** 
 * @param { import('./hltvActions').HLTVNews } news 
 * @param { Channel } channel
 */
export async function postNewsThread(news, channel) {
  const message = await channel.send(news.title)

  const thread = await message.startThread({
    name: news.title,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
    reason: 'news',
  })

  return thread.name
}

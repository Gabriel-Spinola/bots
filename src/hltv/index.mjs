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
  const channel = client.channels.cache.get(newsChannelId)

  const webhooks = await channel.fetchWebhooks()
  const webhook = webhooks.first()

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
      const title = newsLine.querySelector('.newstext') 

      if (!title) {
        return
      }

      return { 
        title: title.textContent,
        link: newsLine.getAttribute('href'),
        content: [],
      } 
    })

    return newsLinesInfo
  }, todaysHeaderSelector)

  console.log('NEWS COLLECTED:', todayNews)

  for (const news of todayNews) {
    if (!news) {
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
            .replace(/\n/g, '\n') // Replace line breaks with '\n** **'*/
            .replace(/[^\S\n]+/g, ' ') // Replace consecutive white spaces (excluding tabs) with a single space
      )
    }, contentSelector)

    news.content = limitedSplit(content[0], 1999)
    console.log(news.content)
    
    const thread = await postNewsThread(news, channel, webhook)
    if (!thread) {
      break
    }

    console.log('GOING BACK TO HOME PAGE')

    await page.goBack()
  }

  await browser.close()
})

hltvClient.login(process.env.HLTV_BOT_SECRET)

/** 
 * @param { import('./hltvActions').HLTVNews } news 
 * @param { Channel } channel
 * @param {*} webhook
 */
export async function postNewsThread(news, channel, webhook) {
  try {
    const message = await channel.send(`> **${news.title}**`)

    // TODO - treat images
    //await channel.send({ files: [{attachment: 'https://img-cdn.hltv.org/gallerypicture/Kj061TW8kIEkXt_qnKPPMQ.jpg', name: 'heading-img'}] })

    const thread = await message.startThread({
      name: news.title,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
      reason: 'news',
    })

    for (const content of news.content) {
      await webhook.send({
        content: content,
        threadId: thread.id,
      })
    }
    
    console.log('CREATED THREAD: ', thread.name)

    return thread.name
  } catch (error) {
    console.error('FAILED TO CREATE THREAD: ', news.title)
    console.error(error)

    return null
  }
}

function limitedSplit(text, limit) {
  if (text.length <= limit) {
    return [text];
  }

  const parts = [];

  // Calculate the number of parts needed
  const numParts = Math.ceil(text.length / limit);

  for (let i = 0; i < numParts; i++) {
    const start = i * limit;
    const end = (i + 1) * limit;

    parts.push(text.substring(start, end));
  }

  return parts;
}
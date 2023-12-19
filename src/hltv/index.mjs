import 'dotenv/config'
import puppeteer from "puppeteer";
import { Client, Events, GatewayIntentBits } from "discord.js";

const BASE_URL = 'https://www.hltv.org'

const hltvClient = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
]})

// NOTE - business logic -> Only search for the day news. Then wait for full 24 hours and repeat

hltvClient.on(Events.ClientReady, async function (client) {
  console.log(`Logged as ${client.user.id}`)

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  })

  const page = await browser.newPage()

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })

  const todaysHeaderSelector = '.standard-list'
  const todayNews = await page.evaluate((selector) => {
    const newsLines = Array.from(document.querySelector(selector).children)
    const newsLinesLinks = newsLines.map(newsLine => newsLine.getAttribute('href'))

    return newsLinesLinks
  }, todaysHeaderSelector)

  console.log(todayNews)

  const promises = todayNews.map(async (news) => await page.goto(`${BASE_URL}${news}`));

  // Use Promise.all to wait for all promises to resolve
  await Promise.all(promises);
  
/*
  const titleSelector = '.newstext'
  const news = await page.evaluate((selector) => {
    const newsList = document.querySelectorAll(selector)

    return Array.from(newsList).map((newsLine) => { 
      const title = newsLine.textContent.replace(/\s+/g, ' ').trim()

      return { title }
    })
  }, titleSelector)
*/
//  console.log(JSON.stringify(news))

  await new Promise(r => setTimeout(r, 1000*60));

  await browser.close()
})

hltvClient.login(process.env.HLTV_BOT_SECRET)
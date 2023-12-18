import 'dotenv/config'
import puppeteer from "puppeteer";
import { Client, Events, GatewayIntentBits } from "discord.js";

const hltvClient = new Client({ intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, 
]})

hltvClient.on(Events.ClientReady, async function (client) {
  console.log(`Logged as ${client.user.id}`)

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  })

  const page = await browser.newPage()

  await page.goto('https://www.hltv.org', { waitUntil: 'domcontentloaded' })

  const news = await page.evaluate(() => {
    const newsList = document.querySelectorAll('.newsline')

    return Array.from(newsList).map((article) => {
      const title = article.querySelector('.newstext').innerText

      return { title }
    })
  })

  console.log(JSON.stringify(news))

  await browser.close()
})

hltvClient.login(process.env.HLTV_BOT_SECRET)
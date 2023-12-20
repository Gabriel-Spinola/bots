import { Channel } from "discord.js"

export type HLTVNews = {
  title: string
  link: string
  content?: string | null
}

export async function postNewsThread(news: HLTVNews, channel: Channel): string;
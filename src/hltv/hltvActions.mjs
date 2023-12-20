import { HLTVNews } from "./hltvActions";
import { Channel, ThreadAutoArchiveDuration } from "discord.js";

/** 
 * @param { HLTVNews } news 
 * @param { Channel } channel
 */
export async function postNewsThread(news, channel) {
  const thread = await channel.threads.create({
    name: news.title,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
    reason: 'news',
  })

  return thread.name
}

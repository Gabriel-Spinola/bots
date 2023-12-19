import { VercelRequest, VercelResponse } from '@vercel/node';

import fs from 'fs'
import 'dotenv/config'
import { GatewayIntentBits, Events, Client } from 'discord.js'
import express from 'express'
import { getImage } from '../src/telegram.mjs'

/**
 * 
 * @param {VercelRequest} request 
 * @param {VercelResponse} response 
 */
export default async function handler(request, response) {
  return response.status(200).json({data: "Hi"})
}
import fs from 'fs'
import { Sticker, createSticker, StickerTypes } from 'wa-sticker-formatter' // ES6
// const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter') // CommonJS

import { downloadMediaMessage } from "baileys";
import fs from "fs";
import path from "path";
import stylizedChar from '../utils/fancy.js';

export async function take(client, message) {
    try {
        const remoteJid = message.key.remoteJid;
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const commandAndArgs = messageBody.slice(1).trim(); // Remove prefix and trim
        const parts = commandAndArgs.split(/\s+/); // Split command and arguments

        let username;
        let text;
        const args = parts.slice(1); // Extract arguments

        if (args.length <= 0) {
            username = message.pushName || "Unknown"; // Fallback to sender's name
            text = username;
        } else {
            username = args.join(" "); // Combine all args into one string
            text = username;
        }

        if (!quotedMessage || !quotedMessage.stickerMessage) {
            return client.sendMessage(remoteJid, { text: stylizedChar("❌ Reply to a sticker to modify it!" )});
        }

        // Download the original sticker
        const stickerBuffer = await downloadMediaMessage({message:quotedMessage},
            'buffer',
            {},
            { logger: console } // Ajout du logger pour le débogage (important!)
        );

        if (!stickerBuffer) {
            return client.sendMessage(remoteJid, { text: "❌ Failed to download sticker!" });
        }

        // Save temporary sticker file
        const tempStickerPath = path.resolve("./temp_sticker.webp");

        fs.writeFileSync(tempStickerPath, stickerBuffer);

        // Detect if the sticker is animated
        const isAnimated = quotedMessage.stickerMessage.isAnimated || false;


        // Modify metadata with the user's input
        const sticker = new Sticker(tempStickerPath, {
            pack: username, // The pack name
            author: text, // The author name
            type: StickerTypes.FULL, // The sticker type
            categories: ['🤩', '🎉'], // The sticker category
            id: '12345', // The sticker id
            quality: 50, // The quality of the output file
            background: '#000000' // The sticker background color (only for full stickers)
        })
        
        const buffer = await sticker.toBuffer() // convert to buffer
        // or save to file
        await sticker.toFile('sticker.webp')
        
        // or get Baileys-MD Compatible Object
        client.sendMessage(remoteJid, await sticker.toMessage())
        
    
        // Send sticker
        // await client.sendMessage(remoteJid, stickerMessage, { quoted: message });

        // Cleanup
        fs.unlinkSync(tempStickerPath);
        console.log(`✅ Sticker sent successfully with "${username}" metadata!`);

    } catch (error) {
        console.error("❌ Error:", error);
        await client.sendMessage(message.key.remoteJid, { text: `⚠️ Error modifying sticker: ${error}` });
    }
}

export default take;
 { downloadMediaMessage } from 'baileys'

export async function photo(client, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const target = quoted?.stickerMessage
        
        if (!target) {
            return await client.sendMessage(message.key.remoteJid, {
                text: '📸 *Beni Xd*\n\nRépondez à un sticker pour le convertir en image.\n\nUsage: .photo (réponse à un sticker)'
            })
        }

        const buffer = await downloadMediaMessage({ message: quoted }, "buffer")
        const filename = `./temp/sticker-${Date.now()}.png`

        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')
        fs.writeFileSync(filename, buffer)

        await client.sendMessage(message.key.remoteJid, {
            image: fs.readFileSync(filename),
            caption: '✨ Beni xd'
        })

        fs.unlinkSync(filename)

    } catch (e) {
        console.log(e)
        await client.sendMessage(message.key.remoteJid, {
            text: '❌ Erreur de conversion.'
        })
    }
}

export async function tomp3(client, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const target = quoted?.videoMessage
        
        if (!target) {
            return await client.sendMessage(message.key.remoteJid, {
                text: '🎵 *Digital Crew 243*\n\nRépondez à une vidéo pour extraire l\'audio.\n\nUsage: .toaudio (réponse à une vidéo)'
            })
        }

        const buffer = await downloadMediaMessage({ message: quoted }, "buffer")
        const inputPath = `./temp/video-${Date.now()}.mp4`
        const outputPath = `./temp/audio-${Date.now()}.mp3`

        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')
        fs.writeFileSync(inputPath, buffer)

        const { exec } = await import('child_process')
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${inputPath} -vn -ab 128k -ar 44100 -y ${outputPath}`, (err) => {
                if (err) return reject(err)
                resolve()
            })
        })

        await client.sendMessage(message.key.remoteJid, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mp4',
            ptt: false
        })

        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)

    } catch (e) {
        console.log(e)
        await client.sendMessage(message.key.remoteJid, {
            text: '❌ Erreur de conversion audio.'
        })
    }
}

export default { photo, tomp3 }
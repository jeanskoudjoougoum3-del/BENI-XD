async function bug(message, client, texts, num) {
    try {
        const remoteJid = message.key?.remoteJid;
        await client.sendMessage(remoteJid, {
            image: { url: `database/${num}.jpg` },
            caption: `> ${texts}`,
            contextInfo: {
                externalAdReply: {
                    title: "BENI BOT",
                    body: "𝗕𝗘𝗡𝗜𝗫 𝗫𝗗",
                    mediaType: 1,
                    thumbnailUrl: `https://whatsapp.com/channel/0029VbBrmrrI1rcmWLCj1k1H`,
                    renderLargerThumbnail: false,
                    mediaUrl: `${num}.jpg`,
                    sourceUrl: `${num}.jpg`
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
}

export default bug;
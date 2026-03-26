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
┃      <b>╰➤ Melihat list pr

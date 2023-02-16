const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ["--no-sandbox"] },
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

async function chatGPT(message) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: message,
    temperature: 0,
    max_tokens: 1000,
  });
  return completion.data.choices[0].text;
}

client.on("ready", () => {
  console.log("Client is ready!");
});

client.initialize();

client.on("message", async (message) => {
  const content = message.body;
  console.log("message", content);

  if (content.toLocaleLowerCase().startsWith("gpt ")) {
    const searchTerm = content.substring(4, content.length).trim();

    if (searchTerm.trim().length > 0) {
      const gptResponse = await chatGPT(searchTerm);
      console.log(gptResponse);
      message.reply(`[TARIMBA GPT]\n${gptResponse}`);
    }
  }
});

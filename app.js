'use strict'

require('dotenv/config');

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios').default //Axios para fazer requisições no LinkApi

const token = `${process.env.BOT_TOKEN}`;

const bot = new TelegramBot(token, {polling: true});

let executionTime = '';
const executeMonitoring = (chatId) => {
  executionTime = setInterval(function(){
    const url = `${process.env.API_URL}${process.env.API_KEY}`
    axios.get(url)
      .then(function (response) {
          if(response.status === 200){
            bot.sendMessage(chatId, `Servidor funcionando normalmente ${new Date()}`);
          }
          console.log(response)
      })
      .catch(function (error) {
        let parsedError = JSON.stringify(error.response.data)
        bot.sendMessage(chatId, `Instabilidade encontrada no LinkApi ${new Date()}`);
        bot.sendMessage(chatId, `Mensagem do erro: ${parsedError}`)
        console.log(error);
      })
      .then(function () {
      });
}, 600000);
}
const stopMonitoring = () => {
  clearInterval(executionTime)
}

let isMonitoring = 0;
bot.onText(/\/command (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1];

  // if(command !== "ajuda" || command !== "monitorar" || command !== "parar"){
  //   bot.sendMessage(chatId, "O comando que você digitou é inválido, experimente digitar /command ajuda")
  // }

  if(command === "ajuda"){
    bot.sendMessage(chatId, "Comandos disponíveis:\n /command monitorar \n /command parar");
  }
  
  if(command === "monitorar"){
    if(isMonitoring === 1){
      return bot.sendMessage(chatId, "O Bot já está monitorando, para parar de executar digite /command parar");
    }
    bot.sendMessage(chatId, "Monitoramento iniciado");
    isMonitoring = 1;
    executeMonitoring(chatId)
  }
  if(command === "parar"){
    if(isMonitoring === 0){
      return bot.sendMessage(chatId, "O Bot já está parado, para executar utilize o comando /command monitorar");
    }
    bot.sendMessage(chatId, "Monitoramento parado");
    isMonitoring = 0
    stopMonitoring()
  }
});

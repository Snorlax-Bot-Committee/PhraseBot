const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    let generalChannel = client.channels.get(auth.generalChannelId) // Replace with known channel ID
    generalChannel.send("Hello, world!")
});

client.login(auth.token);
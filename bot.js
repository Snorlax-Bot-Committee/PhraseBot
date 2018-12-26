const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const auth = require('./auth.json');
const http = require('https')
const command_char='$';
var catchPhrases=null;
const catchPhraseFile="memory.json";
const youtube_video_url="https://www.youtube.com/watch?v="
//Sync will be issue with multi servers probably just do DB >_>
saveRegex=/^save *["'](.*)["'] *["'](.*)["']$/;
lmgtfyRegex=/^lmgtfy  *(.*)$/
youtubeRegex=/^youtube *(.*)$/


//Not in use but could be useful when 
//removeRegex=/^remove \'(.*)\'$/

//Reads Json in catchPhrases file to memory
function readFile(){
	return JSON.parse(fs.readFileSync(catchPhraseFile,'utf8'))
}

//Writes catchPhrase data object to catchPhraseFile listed above
function saveFile(){
	fs.writeFile(catchPhraseFile, JSON.stringify(catchPhrases), function(err) {
	    if (err) {
	        console.log(err);
	    }
	});
}

function getCatchPhrase(user){
	return catchPhrases[user]['catchPhrase']
}

function getResponse(user){
	return catchPhrases[user]['response']
}

//function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

//Clean input function add any input cleaning needed here
function cleanCatchPhrase(input){
	var cleaned_input=input
	cleaned_input=escapeRegExp(cleaned_input)
	return cleaned_input
}
//Sets catchphrase and saves new catch phrase to memory
function setCatchPhraseAndResponse(user,catchPhrase,response){
	console.log(`Setting catchPhrase/response for ${user} to ${catchPhrase} / ${response}`)
	catchResponse={};
	catchResponse['catchPhrase']=cleanCatchPhrase(catchPhrase);
	catchResponse['response']=response;
	console.log(catchResponse)
	catchPhrases[user]=catchResponse;

	saveFile();

}

//Removes the user from file as currently user to catchphrase/response is 1:1
function removeCatchPhrase(user){
	console.log(`removing ${user}`)
	delete catchPhrases[user];
	saveFile()
}

//Add methods to prevent spam here
//Should return false if we believe the user is spamming
function isNotSpam(user){
	var notSpam=true
	return notSpam;
}

//Function to be called on exit to save the current catchPhrases to memory 
function exitHandler() {
	console.log("Saved File on Close")
    saveFile()
    
}

function sendCatchPhrase(user,channel){		
	
	console.log(`Sending the response to ${user}`) 
	channel.send(getResponse(user))
	
}

function search_youtube(channel,query){
	let api_url="https://www.googleapis.com/youtube/v3/search?part=snippet"
	let youtube_address=`${api_url}&maxResults=1&q=${encodeURI(query)}&key=${auth.youtube}`
	http.get(youtube_address, (resp) => {
		let data='';
		resp.on('data', (chunk) => {
			data+=chunk
		});
		resp.on('end', () => {
			let query_data={}
			try {
				query_data=JSON.parse(data)
				console.log(data)
				console.log(query_data)
			}
			catch (error){
				console.log(error)
				return 1;
			}
			let youtube_video=youtube_video_url+query_data.items[0].id.videoId
			channel.send(youtube_video);
		});
		resp.on('error',(error)=>{
			console.log("Error: "+error.message);
		});
	}).on("error", (error) =>{
		console.log("Error: " + error.message);	
	});
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	catchPhrases=readFile()
});

client.on('message', msg => {
	let user=msg.author.id;
	if( msg.content.substring(0,1)===command_char){
		var cmd=msg.content.substring(1).trim()
		
		if(saveRegex.test(cmd)){
			let match=saveRegex.exec(cmd);
			console.log('setCatchPhraseAndResponse')
			//save catch phrase
			setCatchPhraseAndResponse(user,match[1],match[2])
		}
		else if(cmd==="remove"){
			//remove user and catch phrase
			removeCatchPhrase(user)
		}
		else if(lmgtfyRegex.test(cmd)){
			console.log(cmd)
			let match=lmgtfyRegex.exec(cmd);
			msg.channel.send(`http://lmgtfy.com/?q=${encodeURI(match[1])}`)
		}
		else if (youtubeRegex.test(cmd)){
			console.log(cmd)
			let match=youtubeRegex.exec(cmd)
			search_youtube(msg.channel,match[1]);
		}
	}
	else if (catchPhrases[user]!=null){
		//Set regex to catch phrase for user if exists
		catchPhraseRegex=new RegExp(`.*${getCatchPhrase(user)}.*`,"")
		if(catchPhraseRegex.test(msg.content) && isNotSpam(user)){
			sendCatchPhrase(user,msg.channel)
		}
		
	}
});


//This one worked I found out on accident
client.on('error',exitHandler.bind())
//Not sure that either of the following lines do anything
client.on('SIGINT',exitHandler.bind())
client.on('uncaughtException',(error)=>{
	console.log(error.message)
});


client.login(auth.token);




const http = require('https')
const auth = require('./auth.json');
const youtube_video_url="https://www.youtube.com/watch?v="

module.exports = {
	search_youtube: function (channel,query){
		let api_url="https://www.googleapis.com/youtube/v3/search?part=snippet"
		let youtube_address=`${api_url}&maxResults=15&q=${encodeURI(query)}&key=${auth.youtube}`
		http.get(youtube_address, (resp) => {
			let data='';
			resp.on('data', (chunk) => {
				data+=chunk
			});
			resp.on('end', () => {
				let query_data={}
				try {
					query_data=JSON.parse(data)
				}
				catch (error){
					console.log(error)
					return 1;
				}
				let youtube_video_id=query_data.items[0].id.videoId

				for (i in query_data.items){
					resource=query_data.items[i];
					if( resource.id.kind==="youtube#video"){
						youtube_video_id=resource.id.videoId
						break;
					}
					else{
						console.log(resource)
					}
				}
				let youtube_video=youtube_video_url+youtube_video_id
				channel.send(youtube_video);
			});
			resp.on('error',(error)=>{
				console.log("Error: "+error.message);
			});
		}).on("error", (error) =>{
			console.log("Error: " + error.message);	
		});
	}
};

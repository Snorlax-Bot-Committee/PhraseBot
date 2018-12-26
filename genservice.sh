#!bin/bash
# Run this to generate a service file for systemctl
# genservice.sh user=<username> [bot_path=<path to bot file>|bot_file=<bot file name>|node=<path to node>]
my_name=`basename $0`
which_node=`which node`
bot_file="bot.js"
path_to_bot=$PWD

for arg in $@; do
	
	case $arg in
	user=*)
		user=${arg#*=}
		;;
	node=*)
		which_node=${arg#*=}
		;;
	bot_file=*)
		bot_file=${arg#*=}
		;;
	bot_path=*)
		path_to_bot=${arg#*=}
		;;
	*)
		echo "Unrecognized argument ${arg}"
		exit 1
		;;
	esac

done

if [ -z "$user" ] ; then
	echo "
	User not supplied 
	Please run ./${my_name} user=<username>
	"
	exit 1

fi

if [ ! -f "${path_to_bot}/${bot_file}" ] ; then
	echo "
	Bot file not found at:
	${path_to_bot}/${bot_file}
	Please make sure you are running this inside the same dir as the bot file 
	or specify the new working directory or bot file with:
	genservice user=<username> bot_path=<path to bot file> bot_file=<bot file name>
	"
	exit 1

fi

if [ -z "$which_node" ] ; then 
	
	echo "
	Please make sure that node is on the path
	or provide node with following command
	./${my_name} user=<username> node=<node_location>
	"
	exit 1

fi


echo "
[Unit]
Description=${bot_file} - Runs the PhraseBot discord bot
After=network.target

[Service]
Type=simple
User=${user}
ExecStart=${which_node} ${path_to_bot}/${bot_file}
Restart=on-failure
WorkingDirectory=${path_to_bot}

[Install]
WantedBy=multi-user.target
" > PhraseBot.service



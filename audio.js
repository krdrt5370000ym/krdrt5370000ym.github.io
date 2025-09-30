function ChannelsPlayer(playerid_src,playerid_type,playerid_text) {
document.body.scrollTop=0;
document.documentElement.scrollTop=0;
document.getElementById('playerid_texts').innerHTML = playerid_text;
const player = videojs('hls-example');
player.src({src:playerid_src,type:playerid_type});
player.play();
document.getElementById('playerid_play').style='display:none;font-size:48px;';
document.getElementById('playerid_pause').style='display:initial;font-size:48px;';
}

function SelectedChaPlayer() {
document.body.scrollTop=0;
document.documentElement.scrollTop=0;
playerid_src=event.target.options[event.target.selectedIndex].dataset.value;
playerid_type=event.target.options[event.target.selectedIndex].dataset.type;
playerid_name=event.target.options[event.target.selectedIndex].dataset.name;
playerid_text=event.target.options[event.target.selectedIndex].text;
document.getElementById('playerid_texts').innerHTML = playerid_name+playerid_text;
const player = videojs('hls-example');
player.src({src:playerid_src,type:playerid_type});
player.play();
document.getElementById('playerid_play').style='display:none;font-size:48px;';
document.getElementById('playerid_pause').style='display:initial;font-size:48px;';
}

function AudioChaPlayer() {
const player = videojs('hls-example');
player.play();
document.getElementById('playerid_play').style='display:none;font-size:48px;';
document.getElementById('playerid_pause').style='display:initial;font-size:48px;';
}

function PlayedPlayer() {
const player = videojs('hls-example');
player.play();
document.getElementById('playerid_play').style='display:none;font-size:48px;';
document.getElementById('playerid_pause').style='display:initial;font-size:48px;';
}

function StoppedPlayer() {
const player = videojs('hls-example');
player.pause();
document.getElementById('playerid_play').style='display:initial;font-size:48px;';
document.getElementById('playerid_pause').style='display:none;font-size:48px;';
}

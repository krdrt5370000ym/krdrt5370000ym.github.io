function ChannelsPlayer(my_src,my_type) {
document.body.scrollTop=0;
document.documentElement.scrollTop=0;
const player = videojs('hls-example');
player.src({src:my_src,type:my_type});
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

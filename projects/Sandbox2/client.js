'use strict';
// Game:        Sandbox version 2
// Developer:   Gage Coates (sg_p4x347)
// Date:        July, 2015 - undefined
// Synopsis:    A sandbox based mining/crafting game written in JavaScript (an OOP update to the original "Sandbox 1.0")

// local storage
if (localStorage.games == undefined) {
	localStorage.games = '{}';
}
for(var x in localStorage)console.log(x+"="+((localStorage[x].length * 2)/1024/1024).toFixed(2)+" MB")
// canvas
var canvas = document.getElementById('mainCanvas');
var ctx = canvas.getContext('2d');
// image interpolation off for IE, Chrome, Firefox
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
// client
var world;
var client = {
	tickTimer: 0,
	keyEvent: undefined,
	renderMenu: function () {
		var sy = Math.floor(client.menu.screen / 4);
		var sx = client.menu.screen - (sy * 4);
		ctx.drawImage(assets.screenSheet,sx*128,sy*128,128,128,(canvas.width-canvas.height)/2-canvas.height,0,canvas.height,canvas.height);
		ctx.drawImage(assets.screenSheet,sx*128,sy*128,128,128,(canvas.width-canvas.height)/2,0,canvas.height,canvas.height);
		ctx.drawImage(assets.screenSheet,sx*128,sy*128,128,128,(canvas.width-canvas.height)/2+canvas.height,0,canvas.height,canvas.height);
		UIelements(client.menu.data);
	},
	menu: null,
	inMenu: true,
	inChat: false,
	chat: '',
	lastChat: '',
	pause: false,
	username: 'test',
	view: {
		width: 24,
		height: 16
	},
	playerIndex: undefined,
	updateView: function () {
		client.view.width = Math.ceil(client.view.height * (canvas.width/canvas.height));
		client.half_vWidth = client.view.width/2;
		client.half_vHeight = client.view.height/2;
		client.half_cWidth = canvas.width/2;
		client.half_cHeight = canvas.height/2;
		client.xScale = Math.ceil(canvas.width/client.view.width);
		client.half_xScale = client.xScale/2;
		client.yScale = Math.ceil(canvas.height/client.view.height);
		client.half_yScale = client.yScale/2;
		client.guiScale = canvas.height/128;
	},
	keyBinds: {
		left: 65,
		right: 68,
		forward: 87,
		back: 83,
		jump: 32,
		inventory: 69,
		escape: 27,
		shift: 16,
		drop: 81,
		chat: 84
	},
	mouseBinds: {
		mine: 0,
		place: 2
	},
	keyMap: newFilledArray(256, false),
	keyLastMap: newFilledArray(256, false),
	mouseMap: newFilledArray(3, false),
	mouseLastMap: newFilledArray(3, false),
	canvasX: 0,
	canvasY: 0,
	gameX: function () {
		return ((client.canvasX - client.half_cWidth) / client.xScale) + world.players[client.playerIndex].x;
	},
	gameY: function () {
		return ((client.canvasY - client.half_cHeight) / client.yScale) + world.players[client.playerIndex].y;
	},
	slotX: function () {
		return Math.round(((client.canvasX - (canvas.width-canvas.height)/2) / (client.guiScale*8))) - 1;
	},
	slotY: function () {
		return Math.round(client.canvasY / (client.guiScale*8)) - 1;
	},
	timeOfLastFrame: Date.now(),
	time: 1/60,
	audiochannels: []
};
// replace settings with stored settings
if (localStorage.client != undefined) {
	var lsClient = JSON.parse(localStorage.client)
	client.view = lsClient.view;
	client.keyBinds = lsClient.keyBinds;
	client.mouseBinds = lsClient.mouseBinds;
	client.username = lsClient.username;
}
client.updateView();
document.oncontextmenu = function () {
	return false;
}

//=======
// Client
//=======

window.requestAnimFrame = (function () {
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function (callback) {
		window.setTimeout(callback, 1000/60);
	};
})();
function animation() {
	// update the time between frames
	client.time = (Date.now() - client.timeOfLastFrame)/1000;
    client.timeOfLastFrame = Date.now();
	// update the client player
	if (client.playerIndex != undefined) {
		server.serverUpdate();
		world.players[client.playerIndex].update();
/* 		world.players.forEach(function (player) {
			player.update();
		}) */
		world.players[client.playerIndex].render();
	}
	// render menu
	if (client.inMenu) {
		client.renderMenu();
	}
	window.requestAnimFrame(animation);
}

//================
// Event Listeners
//================

window.addEventListener('keydown', function (evt) {
	client.keyMap[evt.keyCode] = true;
	client.keyEvent = evt;
	if (!client.inMenu) {
		// Inventory
		if (!client.inChat&&!client.keyLastMap[client.keyBinds.inventory] && client.keyMap[client.keyBinds.inventory]) {
			if (!world.players[client.playerIndex].inStorageGUI) {
				world.players[client.playerIndex].inStorageGUI = true;
				world.players[client.playerIndex].activeGUI = world.players[client.playerIndex].invCrafting;
				client.pause = true;
			} else if (world.players[client.playerIndex].inStorageGUI) {
				world.players[client.playerIndex].inStorageGUI = false;
				world.players[client.playerIndex].activeGUI = null;
				client.pause = false;
			}
			client.keyLastMap[client.keyBinds.inventory] = true;
		}
		// Chat
		if (!client.inChat && !client.keyLastMap[client.keyBinds.chat] && client.keyMap[client.keyBinds.chat]) {
			client.inChat = true;
			client.keyEvent = undefined;
			client.keyLastMap[client.keyBinds.chat] = true;
			client.pause = true;
		}
	}
	if (!client.keyLastMap[client.keyBinds.escape] && client.keyMap[client.keyBinds.escape]) {
		if (client.inChat) {
			client.inChat = false;
			client.chat = '';
			client.pause = false;
		} else if (world.players[client.playerIndex].inStorageGUI) {
			world.players[client.playerIndex].inStorageGUI = false;
			world.players[client.playerIndex].activeGUI = null;
			client.pause = false;
		} else if (!client.inMenu) {
			client.inMenu = true;
			client.menu = JSON.parse(JSON.stringify(assets.menu['game']));
			client.pause = true;
		} else {
			client.inMenu = false;
			client.pause = false;
		}
		client.keyLastMap[client.keyBinds.escape] = true;
	}
evt.preventDefault();
    evt.stopPropagation();
    evt.cancelBubble = true;
    return false;
})
window.addEventListener('keyup', function (evt) {
	client.keyMap[evt.keyCode] = false;
	client.keyLastMap[evt.keyCode] = false;
	if (client.keyEvent != undefined && evt.keyCode == client.keyEvent.keyCode) {
		client.keyEvent = undefined;
	}
})
window.addEventListener('mousedown', function (evt) {
	client.mouseMap[evt.button] = true;
	evt.preventDefault();
})
window.addEventListener('mouseup', function (evt) {
	client.mouseMap[evt.button] = false;
	client.mouseLastMap[evt.button] = false;
})
window.addEventListener('mousemove', function (evt) {
	var rect = canvas.getBoundingClientRect();
    client.canvasX = evt.clientX - rect.left;
    client.canvasY = evt.clientY - rect.top;
})
window.addEventListener('mousewheel', function (evt) {
	if (!evt.ctrlKey) {
	if (!client.inMenu) {
		if (evt.wheelDelta < 0) {
			if (world.players[client.playerIndex].hotbarIndex < 8) {
				world.players[client.playerIndex].hotbarIndex++;
			} else {
				world.players[client.playerIndex].hotbarIndex = 0;
			};
		} else if (evt.wheelDelta > 0) {
			if (world.players[client.playerIndex].hotbarIndex > 0) {
				world.players[client.playerIndex].hotbarIndex--;
			} else {
				world.players[client.playerIndex].hotbarIndex = 8;
			};
		};
	} else {
		// search for scrollbar
		client.menu.data.some(function (element,index) {
			if (element.hasOwnProperty('data') && element.data.type == 'scrollbar') {
				if (evt.wheelDelta <0 && element.data.data.position <= element.data.data.height) {
					element.y += 0.1 * (canvas.height-(element.height +2)*client.guiScale);
				} else if (evt.wheelDelta >0 && element.data.data.position >= 0) {
					element.y -= 0.1 * (canvas.height-(element.height +2)*client.guiScale);
				}
				if (element.y <= (element.height/2+2)*client.guiScale) {
					element.y = (element.height/2+2)*client.guiScale
				} else if (element.y >= canvas.height-(element.height/2+2)*client.guiScale) {
					element.y = canvas.height-(element.height/2+2)*client.guiScale
				}
				element.data.data.position = ((element.y-(element.height/2+2)*client.guiScale)/(canvas.height-(element.height/2+2)*client.guiScale*2))*element.data.data.height;
				return true;
			}
		})
	}
	}
	//evt.preventDefault();
})	
window.addEventListener('resize', client.updateView, false);
function assetLoad() {
	client.menu = assets.menu['titlescreen'];
	client.updateView();
	animation();
	// audio
	for (var a = 0; a < 10; a++) {				// prepare the channels
		client.audiochannels[a] = new Array();
		client.audiochannels[a]['channel'] = new Audio();		// create a new audio object
		client.audiochannels[a]['finished'] = -1;				// expected end time for this channel
	};
}
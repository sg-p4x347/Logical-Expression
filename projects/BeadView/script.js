// Script: Bead View
// Developer: Gage Coates
// Date: 8/7/16
// Description: A small application that allows the easy placement of assorted beads on digital jewellery
//localStorage.clear();
// application
var application = new Application();

// gets called once the html is loaded
function Initialize() {
	application.Initialize();
}

// application class
function Application () {
	// canvas
	this.canvas;
	this.ctx;
	this.scale;
	// jewellery
	this.textures = {};
	this.beads = [];
	this.jewellery = new Jewellery();
	
	this.Circumference = function (radius) {
		return 2 * Math.PI * radius;
	}
	this.Render = function () {
		var self = this;
		var jewellery = self.jewellery;
		self.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		self.ctx.save();
		self.ctx.translate(self.canvas.width/2,self.canvas.height/2);
		
		// render string
		self.ctx.beginPath();
		self.ctx.arc(0,0,jewellery.radius * self.scale,0,Math.PI*2);
		self.ctx.strokeStyle = jewellery.color;
		self.ctx.lineWidth = jewellery.stringWidth * self.scale;
		self.ctx.stroke();
		
		// info
		self.ctx.fillStyle = 'white';
		self.ctx.font = '30px Arial';
		self.ctx.textAlign = 'center';
		self.ctx.fillText(self.jewellery.radius * 2 + '" across; ' + Math.ceil(self.Circumference(self.jewellery.radius)) + '" needed',0,0);
		
		// render bead array onto circle
		var length = 0;
		self.ctx.rotate(Math.PI/2);
		jewellery.beads.forEach(function (bead) {
			length += (bead.radius * 2 * self.jewellery.mirror);
			if (length < self.Circumference(self.jewellery.radius)) {
				self.ctx.rotate(bead.radius / jewellery.radius);
				var offset = (2 * Math.PI)/self.jewellery.mirror;
				for (var theta = 0; theta < 2 * Math.PI; theta += offset) {
					var texture = self.textures[bead.color + ' ' + bead.type];
					if (texture) {
						self.ctx.drawImage(texture, 0,0,texture.width,texture.height,Math.round((jewellery.radius - (bead.radius*(texture.width/texture.height))) * self.scale),Math.round(-bead.radius * self.scale),Math.round((bead.radius*(texture.width/texture.height))*2 * self.scale),Math.round(bead.radius*2*self.scale));
					}
					self.ctx.rotate(offset);
				}
				self.ctx.rotate(offset);
				self.ctx.rotate(bead.radius / jewellery.radius);
			}
		});
		self.ctx.restore();
	}
	this.Resize = function () {
		this.canvas.height = window.innerHeight- 16;
		this.canvas.width = window.innerHeight- 16;
		var view = document.getElementById('view');
		view.style.width = this.canvas.width;
		view.style.height = this.canvas.height;
		this.scale = (0.4 * parseInt(this.canvas.width))/this.jewellery.radius;
	}
	this.Change = function () {
		var load = document.getElementById('load');
		while( load.firstChild) {
			load.firstChild.remove();
		}
		for (var name in JSON.parse(localStorage.jewellery)) {
			var option = document.createElement('OPTION');
			option.value = name;
			option.innerHTML = name;
			load.appendChild(option);
		}
		load.value = document.getElementById('name').value;
	}
	this.Initialize = function () {
		var self = this;
		// canvas
		self.canvas = document.getElementById('canvas');
		window.onresize = function () {
			self.Resize();
			self.Render();
		}
		self.ctx = this.canvas.getContext('2d');
		self.Resize();
		
		// bead removal
		document.getElementById('remove').onmousedown = function () {
			self.jewellery.beads.pop();
			self.Render();
		}
		document.getElementById('clear').onmousedown = function () {
			self.jewellery.beads = [];
			self.Render();
		}
		// saving
		if (!localStorage.jewellery) {
			localStorage.jewellery = JSON.stringify({});
		}
		document.getElementById('save').onmousedown = function () {
			if (self.jewellery.beads.length > 0) {
				var jewellery = JSON.parse(localStorage.jewellery);
				jewellery[document.getElementById('name').value] = self.jewellery;
				localStorage.jewellery = JSON.stringify(jewellery);
				self.Change();
			}
		}
		// deleting
		document.getElementById('delete').onmousedown = function () {
			var name =document.getElementById('load').value;
			if (name) {
				var jewellery = JSON.parse(localStorage.jewellery);
				delete jewellery[name];
				localStorage.jewellery = JSON.stringify(jewellery);
				self.Change();
			}
		}
		// loading
		document.getElementById('load').onchange = function () {
			if (window.localStorage.jewellery) {
				self.jewellery = JSON.parse(localStorage.jewellery)[document.getElementById('load').value];
				document.getElementById('name').value = document.getElementById('load').value;
				// set controls
				document.getElementById('radius').value = self.jewellery.radius;
				self.Resize();
				document.getElementById('mirror').value = self.jewellery.mirror;
				self.Render();
			}
		}
		self.Change();
		// jewellery radius
		var radius = document.getElementById('radius');
		radius.onchange = function () {
			self.jewellery.radius = parseFloat(radius.value);
			self.Resize();
			self.Render();
		}
		radius.onchange();
		// mirroring
		var mirror = document.getElementById('mirror');
		mirror.onchange = function () {
			self.jewellery.mirror = parseInt(mirror.value);
			self.Render();
		}
		mirror.onchange();
		
		// default bead set
		self.beads.push(new Bead('silver', 'square',1/16));
		self.beads.push(new Bead('white', 'square',1/16));
		self.beads.push(new Bead('black', 'square',1/16));
		self.beads.push(new Bead('purple', 'square',1/16));
		self.beads.push(new Bead('red', 'square',1/16));
		self.beads.push(new Bead('orange', 'square',1/16));
		self.beads.push(new Bead('yellow', 'square',1/16));
		self.beads.push(new Bead('green', 'square',1/16));
		self.beads.push(new Bead('cyan', 'square',1/16));
		self.beads.push(new Bead('blue', 'square',1/16));
		
		self.beads.push(new Bead('silver', 'round',0.058));
		self.beads.push(new Bead('white', 'round',0.058));
		self.beads.push(new Bead('black', 'round',0.058));
		self.beads.push(new Bead('purple', 'round',0.058));
		self.beads.push(new Bead('red', 'round',0.058));
		self.beads.push(new Bead('orange', 'round',0.058));
		self.beads.push(new Bead('yellow', 'round',0.058));
		self.beads.push(new Bead('green', 'round',0.058));
		self.beads.push(new Bead('cyan', 'round',0.058));
		self.beads.push(new Bead('blue', 'round',0.058));
		
		self.beads.push(new Bead('silver', 'short',3/64));
		self.beads.push(new Bead('white', 'short',3/64));
		self.beads.push(new Bead('black', 'short',3/64));
		self.beads.push(new Bead('purple', 'short',3/64));
		self.beads.push(new Bead('red', 'short',3/64));
		self.beads.push(new Bead('orange', 'short',3/64));
		self.beads.push(new Bead('yellow', 'short',3/64));
		self.beads.push(new Bead('green', 'short',3/64));
		self.beads.push(new Bead('cyan', 'short',3/64));
		self.beads.push(new Bead('blue', 'short',3/64));
		
		self.beads.push(new Bead('clear', 'bicone',0.11375));
		self.beads.push(new Bead('green', 'bicone',0.11375));
		self.beads.push(new Bead('blue', 'bicone',0.11375));
		self.beads.push(new Bead('purple', 'bicone',0.11375));
		self.beads.push(new Bead('red', 'bicone',0.11375));
		self.beads.push(new Bead('pink', 'bicone',0.11375));
		
		self.beads.push(new Bead('silver', 'seed',0.058));
		self.beads.push(new Bead('gold', 'seed',0.058));
		self.beads.push(new Bead('copper', 'seed',0.058));
		self.beads.push(new Bead('bronze', 'seed',0.058));
		self.beads.push(new Bead('umber', 'seed',0.058));
		
		self.beads.push(new Bead('blue', 'stone',0.08125));
		
		self.beads.push(new Bead('wood', 'misc',0.125));
		self.beads.push(new Bead('cylinder', 'misc',0.2167));
		self.beads.push(new Bead('rectangle', 'misc',0.1375));
		self.beads.push(new Bead('barrel', 'misc',0.17));
		
		var loaded = 0;
		self.beads.forEach(function (bead) {
			var texture = new Image();
			texture.onload = function () {
				loaded++;
				if (loaded >= self.beads.length) {
					// display once all textures are loaded
					self.Render();
				}
			}
			var src = 'beads/' + bead.color + ' ' + bead.type + '.png';
			// load texture
			texture.src = src;
			self.textures[bead.color + ' ' + bead.type] = texture;
			// fill selection
			var li = document.createElement('LI');
			li.className = 'bead';
			li.onmousedown = function () {
				self.jewellery.beads.push(bead);
				self.Render();
			}
			var img = document.createElement('IMG');
			img.className = 'thumbnail';
			img.src = src;
			
			li.appendChild(img);
			document.getElementById(bead.type).appendChild(li);
		});
		// settings area
		var settings = document.getElementById('settings');
	}
}
function Jewellery (radius) {
	this.radius = radius ? radius : 1.5; // inches
	this.mirror = 1;
	this.color = 'silver';
	this.stringWidth = 1/32;
	this.beads = [];
}
function Bead (color,type,radius) {
	this.type = type;
	this.radius = radius; // inches
	this.color = color;
}
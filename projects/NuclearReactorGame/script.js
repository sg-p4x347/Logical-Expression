// Script: Nuclear Reactor
// Developer: Gage Coates
// Date: May, 2016

document.oncontextmenu = function () {
	return false;
}
var game;
// gets called once the html is loaded
function initialize() {
	game = new Game();
	// start the updates
	game.initialize();
}
var voxelData = {
	'Thorium': {
tier: 0,
type: 'fuel_rod',
sprite: 'sprites/thorium.png',
pressure: 125000,
rate: 5000,
price: 100,
meltingPoint: 1000,
	},
	'Uranium': {
tier: 1,
type: 'fuel_rod',
sprite: 'sprites/uranium.png',
pressure: 3000000,
rate: 10000,
price: 2000,
meltingPoint: 2000,
	},
	'Plutonium': {
tier: 2,
type: 'fuel_rod',
sprite: 'sprites/plutonium.png',
pressure: 20000000,
rate: 50000,
price: 10000,
meltingPoint: 3200,
	},
	'Coatonium': {
tier: 3,
type: 'fuel_rod',
sprite: 'sprites/coatonium.png',
pressure: 300000000,
rate: 200000,
price: 100000,
meltingPoint: 7000,
	},
	'Depleted fuel': {
type: 'depleted_fuel',
sprite: 'sprites/depleted_fuel.png',
meltingPoint: 2000,
	},
	'Molten fuel': {
type: 'molten_fuel_rod',
sprite: 'sprites/molten_fuel_rod.png',
meltingPoint: 1510,
	},
	'Control rod': {
type: 'control_rod',
sprite: 'sprites/control_rod.png',
price: 75,
meltingPoint: 1000,
	},
	'Standard casing': {
type: 'casing',
sprite: 'sprites/casing.png',
health: 16,
price: 50,
meltingPoint: 1510,
	},
	'Galvanized casing': {
type: 'casing',
sprite: 'sprites/galvanized_casing.png',
health: 16,
price: 1000,
meltingPoint: 2000 ,
	},
	'Reinforced casing': {
type: 'casing',
sprite: 'sprites/reinforced_casing.png',
health: 16,
price: 4000,
meltingPoint: 3000 ,
	},
	'Molten metal': {
type: 'molten_metal',
sprite: 'sprites/molten_metal.png',
meltingPoint: 1510,
price: 0,
	},
	'Coolant': {
type: 'coolant',
sprite: 'sprites/water.gif',
meltingPoint: 1510,
	},
	'Coolant ejector': {
type: 'coolant_ejector',
sprite: 'sprites/coolant_ejector.png',
health: 1,
price: 75,
rate: 0.5,
meltingPoint: 1510,
	},
	'Turbo ejector': {
type: 'coolant_ejector',
sprite: 'sprites/turbo_ejector.png',
health: 1,
price: 4000,
rate: 1.0,
meltingPoint: 1510,
	}
}
// Game wrapper
function Game() {
	// private
	this.debug = false;
	this.grid = document.getElementById('grid'); // Grid class
	this.achievements = {};
	this.selection =  []; // block selection
	this.selected; // currently selected voxel type
	this.pressureSum = 0;
	this.money = 1000;
	this.rate;
	this.timeStep = 1/60; // in seconds
	// mouse
	this.mouse = {
left: false,
middle: false,
right: false
	};
	this.reload = function () {
		var self = this;
		self.stop();
		window.location.reload();
	};
	this.start = function () {
		var self = this;
		self.interval = window.setInterval(function () {
			// update the simulation
			var blocks = self.grid.update();
			// fuel rods create pressure
			blocks.fuelRods.forEach(function (fuel) {
				if (fuel.health > 0) {
					fuel.addPressure((self.timeStep)*voxelData[fuel.name].rate);
					fuel.addHealth(-((self.timeStep)*voxelData[fuel.name].rate)/voxelData[fuel.name].pressure);
				} else {
					fuel.initialize('Depleted fuel');
					fuel.setHealth(0);
				}
				fuel.updateSprite();
			});
			// pressure damages casings
			blocks.casings.forEach(function (casing) {
				self.damageVoxel(casing,self.timeStep);
			});
			// eject pressure
			blocks.coolantEjectors.forEach(function (ejector) {
				if (!self.damageVoxel(ejector,self.timeStep)) {
					var transfer = ejector.pressure * voxelData[ejector.name].rate;
					self.pressureSum += transfer;
					// reset the ejector
					ejector.addPressure(-transfer);
				}
			});
			var previousMoney = self.money;
			self.money += self.pressureSum/1000; // 1000 pressure = $1
			self.pressureSum = 0;
			// update money supply
			self.rate = Math.round((self.money-previousMoney)/self.timeStep);
			document.getElementById('money').innerHTML = '$' + printWithCommas(Math.floor(self.money)); 
			document.getElementById('rate').innerHTML = printWithCommas(self.rate);
			// check achievements
			if (self.debug || self.money >= 1000000) {
				document.getElementById('size').className = 'ui__button smallMargin bold';
			}
			if (!self.debug) {
				for (var achievement in self.achievements) {
					if (self.achievements[achievement].condition()) {
						// update local storage
						self.storeAchievements();
					}
				}
			}
			if (self.debug) {
				self.stop();
			}
		}, self.timeStep*1000);
	}
	this.storeAchievements = function () {
		var self = this;
		if (typeof(Storage) !== "undefined") {
			var reactorGame = {achievements:{},money:self.money};
			for (var achievement in self.achievements) {
				reactorGame.achievements[self.achievements[achievement].name] = self.achievements[achievement].achieved;
			}
			localStorage.reactorGame = JSON.stringify(reactorGame);
		}
	}
	this.loadAchievements = function () {
		var self = this;
		if (typeof(Storage) !== "undefined" && localStorage.reactorGame !== undefined) {
			var reactorGame = JSON.parse(localStorage.reactorGame);
			// money
			self.money = Math.max(reactorGame.money, 1000);
			// achievements
			for (var achievement in reactorGame.achievements) {
				if (reactorGame.achievements[achievement]) {
					self.achievements[achievement].achieve();
				}
			};
		}
	}
	this.salvageReactor = function () {
		var self = this;
		self.grid.data.forEach(function (row) {
			row.forEach(function (cell) {
				if (cell.health == 1) {
					self.money += voxelData[cell.name].price;
				}
			});
		});
		self.reload();
	}
	this.damageVoxel = function (voxel,time) {
		if (voxel.pressure >= voxel.meltingPoint) {
			voxel.addHealth(-time/voxelData[voxel.name].health);
		}
		if (voxel.health < 0) {
			voxel.initialize('Molten metal');
			voxel.setHealth(0);
			return true;
		}
		return false;
	}
	this.stop = function () {
		window.clearInterval(this.interval);
	}
	this.interval;
	this.initialize = function () {
		var self = this;
		// block selection
		var selection = document.getElementById('selection');
		for (var type in voxelData) {
			// blacklist unplaceable types
			if (['Coolant','Molten fuel','Molten metal','Depleted fuel'].indexOf(type) == -1) {
				var row = document.createElement('TR');
				// image
				var sprite = document.createElement('TD');
				var voxel = new Voxel(type,true);
				self.selection.push(voxel);
				voxel.sprite.className = "sprite sprite--select";
				sprite.appendChild(voxel.sprite);
				row.appendChild(sprite);
				// price
				var price = document.createElement('TD');
				price.className = 'select';
				price.innerHTML = '$' + printWithCommas(voxelData[type].price);
				row.appendChild(price);
				
				selection.appendChild(row);
			}
		}
		// grid
		self.grid = new Grid(9,9);
		// achievements
		self.initializeAchievements();
		document.getElementById('new').onclick = function () {
			if (window.confirm('Are you sure you want to reset your achievements?')) {
				localStorage.removeItem('reactorGame');
				self.reload();
			}
		}
		document.getElementById('salvage').onclick = function () {
			if (window.confirm('Are you sure you want to turn your ractor into cold hard cash?')) {
				self.salvageReactor();
			}
		}
		// mouse
		window.addEventListener('mousedown', function (event) {
			switch (event.which) {
			case 1: self.mouse.left = true; break;
			case 2: self.mouse.middle = true; break;
			case 3: self.mouse.right = true; break;
			}
			return false;
		});
		window.addEventListener('mouseup', function (event) {
			switch (event.which) {
			case 1: self.mouse.left = false; break;
			case 2: self.mouse.middle = false; break;
			case 3: self.mouse.right = false; break;
			}
			return false;
		});
		window.addEventListener('keydown', function (event) {
			if (self.debug && event.which == 13) {
				self.start();
			}
		});
		document.getElementById('size').onclick = function () {
			if (self.debug || self.money >= 1000000) {
				self.grid.resize(self.grid.width+4,self.grid.width+4);
				self.money-= 1000000;
				// hide the button forever!
				this.className = 'hidden';
			}
		}
		game.start();
	}
	this.initializeAchievements = function () {
		var self = this;
		var list = document.getElementById('achievements');
		//  <$100
		self.achievements['Tight budget'] = new Achievement('Tight budget','less than $100',true);
		self.achievements['Tight budget'].condition = function () {
			if (self.money < 100) {
				self.achievements['Tight budget'].achieve();
				return true;
			}
		}
		//  100 $/s
		self.achievements['Better than fast food'] = new Achievement('Better than fast food','over 100 $/sec',true);
		self.achievements['Better than fast food'].condition = function () {
			if (self.rate >= 100) {
				self.achievements['Better than fast food'].achieve();
				return true;
			}
		}
		//  1000 $/s
		self.achievements['Time is money'] = new Achievement('Time is money','over 1000 $/sec',true);
		self.achievements['Time is money'].condition = function () {
			if (self.rate >= 1000) {
				self.achievements['Time is money'].achieve();
				return true;
			}
		}
		// $10,000
		self.achievements['Entrepreneur'] = new Achievement('Entrepreneur','more than $10,000');
		self.achievements['Entrepreneur'].condition = function () {
			if (self.money >= 10000) {
				self.achievements['Entrepreneur'].achieve();
				return true;
			}
			
		}
		//  2000 $/s
		self.achievements['Overdrive'] = new Achievement('Overdrive','over 2000 $/sec',true);
		self.achievements['Overdrive'].condition = function () {
			if (self.rate >= 2000) {
				self.achievements['Overdrive'].achieve();
				return true;
			}
		}
		// $100,000
		self.achievements['Buisnessman'] = new Achievement('Buisnessman','more than $100,000');
		self.achievements['Buisnessman'].condition = function () {
			if (self.money >= 100000) {
				self.achievements['Buisnessman'].achieve();
				return true;
			}
		}
		// $1,000,000
		self.achievements['Capitalist'] = new Achievement('Capitalist','more than $1,000,000  A true hero!');
		self.achievements['Capitalist'].condition = function () {
			if (self.money >= 1000000) {
				self.achievements['Capitalist'].achieve();
				return true;
			}
		}
		//  <$100
		self.achievements['Penny pincher'] = new Achievement('Penny pincher','no less than $100',true);
		self.achievements['Penny pincher'].condition = function () {
			if (self.achievements['Capitalist'].achieved && !self.achievements['Tight budget'].achieved) {
				self.achievements['Penny pincher'].achieve();
				return true;
			}
		}
		// $10,000,000
		self.achievements['Master mind'] = new Achievement('Master mind','more than $10,000,000');
		self.achievements['Master mind'].condition = function () {
			if (self.money >= 10000000) {
				self.achievements['Master mind'].achieve();
				return true;
			}
		}
		for (var achievement in self.achievements) {
			list.appendChild(self.achievements[achievement].element);
		}
		// load from local storage
		self.loadAchievements();
	}
}
function Grid(width,height) {
	// public
	this.update = function () {
		var self = this;
		// non-coolant blocks
		var special = {coolantInjectors: [], coolantEjectors: [], fuelRods: [], casings: []};
		// pressure simulation
		var add = [];
		for (var i = 0; i < self.data.length; i++) {
			add.push([]);
			for (var j = 0; j < self.data.length; j++) {
				add[i].push(0);
			}
		}
		for (var x = 0; x < self.data.length; x++) {
			for (var y = 0; y < self.data.length; y++) {
				var cell = self.data[x][y];
				// catalogue special blocks
				if (voxelData[cell.name].type == 'coolant_ejector'){
					special.coolantEjectors.push(cell);
				} else if (voxelData[cell.name].type == 'fuel_rod') {	
					if (cell.pressure >= cell.meltingPoint) {
						cell.initialize('Molten fuel');
						cell.setHealth(0);
					} else {
						special.fuelRods.push(cell);
					}
				} else if (voxelData[cell.name].type == 'casing') {
					special.casings.push(cell);
				}
				// pressure simulation
				var adjacent  = [];
				for (var rot = 0; rot< 2; rot += 0.5) {
					var adjX = x + Math.round(Math.cos(rot*Math.PI));
					var adjY = y + Math.round(Math.sin(rot*Math.PI));
					if (adjY >= 0 && adjY <= self.data.length-1 && adjX >= 0 && adjX <= self.data.length-1) {
						var adjCell = self.data[adjX][adjY];
						if ((cell.type == 'casing' && adjCell.type == 'casing') || (adjCell.type != 'casing')) {
							adjacent.push({pressure: adjCell.pressure,x:adjX,y:adjY});
						}
					} else if (!game.debug && cell.pressure > 0 && cell.type != 'casing' && cell.type != 'coolant_ejector') {
						window.alert('Reactor breach!');
						game.reload();
					}
				}
				// add this cell to the calculations
				adjacent.push({pressure: cell.pressure,x:x,y:y});
				// calculate equalized pressure
				var equalized = 0;
				adjacent.forEach(function (adjacentCell) {
					equalized += adjacentCell.pressure;
				});
				equalized /= adjacent.length;
				// add pressure
				add[x][y] += (equalized-cell.pressure) * (adjacent.length/5) * 1;
			}
		}
		// sum up pressures
		for (var x = 0; x < self.data.length; x++) {
			for (var y = 0; y < self.data.length; y++) {
				self.data[x][y].addPressure(add[x][y]);
				// update graphical information
				self.data[x][y].updateSprite();
			}
		}
		// return a catalogue of functional blocks
		return special;
	}
	this.resize = function (width, height) {
		var self = this;
		self.width = width;
		// add new rows
		for (var y = self.table.rows.length; y < height; y ++) {
			self.newRow(self.table.rows[0].cells.length);
		}
		// add new columns
		for (var y = 0; y < height; y++) {
			for (var x = self.table.rows[y].cells.length; x < width; x++) {
				self.newCell(self.table.rows[y],y);
			}
		}
		
	}
	// private
	this.table = document.getElementById('grid');
	this.data = [];
	this.width = width;
	this.initialize = function (width, height) {
		var self = this;
		// html table
		self.table.className = 'grid';
		for (var y = 0; y < height; y++) {
			self.newRow(width);
		}
	}
	this.newRow = function (width) {
		var self = this;
		// rows
			self.data.push([]);
			var row = document.createElement('TR');
			for (var x = 0; x < width; x++) {
				self.newCell(row,self.table.rows.length);
			}
			self.table.appendChild(row);
	}
	this.newCell = function (row,y) {
		var self = this;
		// voxels
		var voxel = new Voxel('Coolant');
		voxel.setPressure(0);
		var cell = document.createElement('TD');
		cell.style.border = '0px';
		cell.appendChild(voxel.sprite);
		row.appendChild(cell);
		self.data[y].push(voxel);
	}
	this.initialize(width, height);
}
function Voxel(name,select) {
	// public
	this.updateSprite = function () {
		var self = this;
		if (self.pressure != null) {
			self.overlay.style.backgroundColor = 'rgba(255,0,0,' + self.pressure/self.meltingPoint + ')';
			self.sprite.title = self.name + '\nTemp: ' + Math.round(self.pressure) + ' C\nMelting Point: ' + self.meltingPoint + ' C';
			if (self.type == 'fuel_rod') {
				self.sprite.title += '\n' + Math.round(self.health * (voxelData[self.name].pressure/voxelData[self.name].rate)) + 's remaining';
			}
			//self.tip.innerHTML = self.name;
		} else {
			self.overlay.style.backgroundColor = null;
		}
	}
	this.setHealth = function (health)  {
		var self = this;
		self.health = health;
		self.healthBar.style.width = self.health*100 + '%';
		var green = Math.floor((self.health)*255);
		var red = Math.floor((1 - self.health)*255);
		if (self.type !== 'fuel_rod' && self.health == 1) {
			self.healthBar.style.backgroundColor = "transparent";
		} else {
			self.healthBar.style.backgroundColor = 'rgb(' + red + ',' + green + ',0)';
		}
	}
	this.addHealth = function (health) {
		var self = this;
		self.setHealth(self.health+health);
	}
	this.setPressure = function (pressure) {
		this.pressure = pressure;
	}
	this.addPressure = function (pressure) {
		var self = this;
		if (self.pressure != null) {
			self.pressure += pressure;
		}
	}
	// private
	this.sprite = document.createElement('DIV');
	this.overlay = document.createElement('DIV');
	this.healthBar = document.createElement('DIV');
	this.tip = document.createElement('DIV');
	// data
	this.select = select;
	this.name;
	this.type;
	this.health = 0;
	this.pressure = 0;
	this.meltingPoint;
	this.initialize = function (name,select) {
		var self = this;
		if (name === null || name === undefined) {
			self.initialize('Casing',select);
		}
		// data
		self.select = select;
		self.name = name;
		self.type = voxelData[self.name].type;
		self.setHealth(1);
		self.meltingPoint = voxelData[self.name].meltingPoint;
		self.addHtml();
	}
	this.addHtml = function () {
		var self = this;
		self.sprite.className = 'sprite';
		if (self.pressure != null && !select) {
			self.sprite.style.backgroundImage = 'url(' + voxelData[self.name].sprite + '), url(' + voxelData['Coolant'].sprite + ')';
		} else {
			self.sprite.style.backgroundImage = 'url(' + voxelData[self.name].sprite + ')';
		}
		// heat overlay
		self.overlay.className = 'sprite';
		self.updateSprite();
		// healthBar
		if (!select && voxelData[self.name].type != 'coolant') {
			self.healthBar.className = 'progress';
		}
	}
	this.addEventListeners = function () {
		var self = this;
		self.sprite.addEventListener('mousedown', function (event) {
			self.placeVoxel(event.which == 1? true: false,event.which == 2? true: false,event.which == 3? true: false );
			if (self.select) {
				game.selected = self.name;
				game.selection.forEach(function (voxel) {
					voxel.sprite.className = 'sprite sprite--select';
				})
				self.sprite.className = 'sprite selected';
			}
			event.preventDefault();
			return false;
		});
		self.sprite.addEventListener('mouseenter', function (event) {
			event.preventDefault();
			self.placeVoxel(game.mouse.left,game.mouse.middle,game.mouse.right);
		});
	}
	this.placeVoxel = function (left,middle,right) {
		var self = this;
		if (!self.select) {
			if (left) {
				// if the existing block can be placed over or the type is the same as the selected type
				if (game.selected != undefined && (['coolant','molten_fuel_rod','molten_metal','depleted_fuel'].indexOf(self.type) != -1 || (self.type == voxelData[game.selected].type))) {
					// tier must be above or same
					if (self.type != voxelData[game.selected].type || (!voxelData[game.selected].hasOwnProperty('tier') || voxelData[game.selected].tier >= voxelData[self.name].tier)) {
						// enough money
						if (game.debug || self.cost()) {
							self.initialize(game.selected);
						}
					}
				}
			} else if (right) {
				if (self.type == 'casing') {
					self.setPressure(0);
				}
				self.initialize('Coolant');
			}
		}
	}
	this.cost = function () {
		var self = this;
		if (game.money >= voxelData[game.selected].price) {
			game.money -= voxelData[game.selected].price;
			return true;
		}
	}
	this.initialize(name,select);
	this.sprite.appendChild(this.overlay);
	this.sprite.appendChild(this.healthBar);
	this.addEventListeners();
}
function Achievement(name,description,hidden) {
	this.name = name;
	this.description = description;
	this.element = document.createElement('LI');
	this.achieved = false;
	this.condition = function () {
		return false;
	};
	this.achieve = function () {
		var self = this;
		self.achieved = true;
		self.element.className = 'achieved achievement';
	}
	this.initialize = function (hidden) {
		var self = this;
		self.element.className = 'locked achievement' + (hidden ? ' hidden' : '');
		self.element.innerHTML = self.name;
		var description = document.createElement('P');
		description.className = 'description smallMargin';
		description.innerHTML = self.description;
		self.element.appendChild(document.createElement('BR'));
		self.element.appendChild(description);
	}
	this.initialize(hidden);
}
printWithCommas = function (x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
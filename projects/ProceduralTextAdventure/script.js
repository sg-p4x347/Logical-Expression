// Script: Procedurally Generated Text Adventure
// Developer: Gage Coates
// Date: April, 2016

// global namespace
var game;

function initialize () {
	game = new Game();
	game.initialize();
}
// Game class
function Game () {
	//=======
	// public
	//=======
	this.newId = function () {
		return this.nextId++;
	}
	//=======
	// private
	//=======
	this.player = new Player('sg_p4x347','male',18,'');
	
	this.regionName = '';
	this.cities = [];
	this.population = [];
	this.families = [];
	this.nextId = 0;
	this.clock;
	
	// html
	
	// main
	this.main;
	this.time;
	this.quests;
	this.scene;
	// interaction screen
	this.table;
	this.places;
	this.people;
	this.things;
	
	// person screen
	this.person;

	// managing the population
	this.managePopulation = function () {
		var self = this;
		if (self.clock.hour == 7 && self.clock.minute == 0) {
			// commute to work
			self.commuteWork();
			self.shufflePopulation();
		} else if (self.clock.hour == 18 && self.clock.minute == 0) {
			// commute to home
			self.commuteHome();
			self.shufflePopulation();
		}
		// random movements every hour
		if (self.clock.minute == 0 && chance(Config.shuffleChancePerHour)) {
			self.shufflePopulation();
		}
	}
	// shuffle all city building populations
	this.shufflePopulation = function () {
		var self = this;
		self.cities.forEach(function (city) {
			city.shufflePopulation();
		});
	}
	// commute everyone in the region to work
	this.commuteWork = function () {
		var self = this;
		// commute all cities
		self.cities.forEach(function (city) {
			city.commuteWork();
		})
	}
	this.commuteHome = function () {
		var self = this;
		self.cities.forEach(function(city) {
			city.commuteHome();
		})
	}
	// GUI
	this.createScene = function () {
		var self = this;
		self.resetActions();
		// create the description
		if (self.player.person instanceof Person) {
			self.loadPerson(self.player.person);
		} else if (self.player.city instanceof City) {
			if (self.player.building instanceof Building) {
				// in the room of a building
				var building = self.player.building;
				self.scene.innerHTML = building.name + '<br>You are in a ' + self.player.room.name + '.';
				self.scene.innerHTML += '<br>' + self.player.room.description;
				// places
				var back = self.newAction('...Exit ' + building.name + '...',true);
				back.addEventListener('click', function () {
					self.player.room = null;
					self.player.building = null;
					self.createScene();
				});
				self.places.appendChild(back);
				building.rooms.forEach(function (room) {
					if (room.id != self.player.room.id) {
						var place = self.newAction(room.name)
						place.addEventListener('click', function () {
							self.player.room = room;
							self.createScene();
						});
						self.places.appendChild(place);
					}
				});
				// people
				self.loadPopulation(self.player.room);
			} else {
				// in a city
				var city = self.player.city;
				self.scene.innerHTML = 'You are in the city of ' + city.name + '.';
				// places
				var back = self.newAction('...Leave ' + city.name + '...',true);
				back.addEventListener('click', function () {
					self.player.city = null;
					self.createScene();
				});
				self.places.appendChild(back);
				city.buildings.forEach(function (building) {
					var place = self.newAction(building.name)
					place.addEventListener('click', function () {
						self.player.building = building;
						// enter the first room
						self.player.room = building.rooms[0];
						self.createScene();
					});
					self.places.appendChild(place);
				});
				// people
				self.loadPopulation(city);
			}
		} else {
			// in the region
			self.scene.innerHTML = 'You are in the region of ' + self.regionName + '.';
			// places
			self.cities.forEach(function (city) {
				var place = self.newAction(city.name)
				place.addEventListener('click', function () {
					self.player.city = city;
					self.createScene();
				});
				self.places.appendChild(place);
			});
		}
	}
	this.loadPopulation = function (object) {
		var self = this;
		object.population.forEach(function (person) {
			var people = self.newAction(person.fullName());
			if (person.fullName().toLowerCase() == 'gage coates') {
				people.className = 'button back';
			}
			people.addEventListener('click', function () {
				self.player.person = person;
				self.createScene();
			});
			self.people.appendChild(people);
		});
	}
	this.loadPerson = function (person) {
		var self = this;
		self.player.person = person;
		// fill out person's information
		var description = person.fullName();
		description += '<br>profession: ' + person.profession.capitalizeFirstLetter();
		description += '<br>place of work: ' + (person.hasProfession() ? person.workPlace.name : 'none');
		description += '<br>family role: ' + (person.hasSpouse() ? (person.spouse.gender === 'female' ? 'Father' : 'Wife') : (person.gender === 'male' ? 'Son' : 'Daughter'));
		description += '<br>age: ' + person.age;
		if (person.fullName().toLowerCase() == 'gage coates') {
			description = person.fullName();
			description += '<br>profession: Programmer';
			description += '<br>Gage Coates is a pretty cool dude, you will never meet him,<br>but he has met you...';
		}
		self.person.innerHTML = description;
		var back = self.newAction('...back...',true);
		back.addEventListener('click', function () {
			self.player.person = null;
			self.interactionScreen();
			self.createScene();
		});
		self.person.appendChild(back);
		self.personScreen();
	}
	this.loadQuests = function () {
		var back = self.newAction('...back...',true);
		back.addEventListener('click', function () {
			self.player.person = null;
			self.interactionScreen();
			self.createScene();
		});
		self.main.appendChild(back);
	}
	this.resetActions = function ()  {
		var self = this;
		self.clearElements(self.places);
		var heading = document.createElement('P');
		heading.innerHTML = 'Enter...';
		self.places.appendChild(heading);
		self.clearElements(self.people);
		var heading = document.createElement('P');
		heading.innerHTML = 'Talk to...';
		self.people.appendChild(heading);
		self.clearElements(self.things);
		var heading = document.createElement('P');
		heading.innerHTML = 'Interact with...';
		self.things.appendChild(heading);
		
	}
	this.newAction = function (name,back) {
		var action = document.createElement('LI');
		action.className = back ? 'button back' : 'button';
		action.style.display = 'block';
		action.style.textAlign = 'center';
		action.innerHTML = name;

		return action;
	}
	this.clearElements = function (parent) {
		while (parent.firstChild) {
			parent.removeChild(parent.firstChild);
		}
	}
	this.generate = function () {
		var self = this;
		// regionName
		self.regionName = NameGenerator.region();
		//===============
		// regional population
		//===============
		var singleMales = [];
		var singleFemales = [];
		// seed families
		for (var f = 0; f < Config.seedFamilies; f++) {
			// surname
			var surname;
			do {
				surname = NameGenerator.surname();
			} while (self.families.searchProperty('surname',surname));
			var father = new Person('male',randWithin(Config.oldest-Config.marryAgeRange/2,Config.oldest+Config.marryAgeRange/2),probability(Config.professions),surname);
			var mother = new Person('female',randWithin(Config.oldest-Config.marryAgeRange/2,Config.oldest+Config.marryAgeRange/2),probability(Config.professions),surname);
			father.spouse = mother;
			mother.spouse = father;
			self.population.push(father);
			self.population.push(mother);
			self.families.push(new Family(father,mother));
		}
		// multiply and be fruitful
		var stillMatching = true;
		while (stillMatching) {
			stillMatching = false;
			// create children
			self.families.forEach(function (family) {
				if (family.children.length == 0) {
					// for an average of children
					for (var c = randWithin(0,Config.children); c >0; c--) {
						// 20-30 years younger than youngest parent
						var age = Math.min(family.father.age,family.mother.age)-randWithin(20+c,30);
						if (age <= 0) {age = 1};
						var profession = 'none';
						if (age >= 20) {
							profession = probability(Config.professions);
						} else if (age >= 15) {
							profession = 'farmer';
						}
						var child = new Person(['male','female'].random(),age,profession,family.father.surname);
						family.father.children.push(child);
						family.mother.children.push(child);
						self.population.push(child);
						family.children.push(child);
						// single only if able to marry
						if (child.age >= Config.marryMinAge) {
							(child.gender === 'male' ? singleMales : singleFemales).push(child);
						}
					}
				}
			});
			// create new families
			singleMales.forEach( function (father,fIndex) {
				singleFemales.some( function (mother,mIndex) {
					// make sure they are not directly related
					if (mother.surname === father.surname) {return true;}
					// we found a match!
					if (Math.abs(father.age-mother.age) <= Config.marryAgeRange) {
						mother.surname = father.surname;
						mother.spouse = father;
						father.spouse = mother;
						self.families.push(new Family(father,mother));
						singleMales.remove(fIndex);
						singleFemales.remove(mIndex);
						stillMatching = true;
						return true;
					}
				});
			});
		}
		// shuffle the families
		self.families.shuffle();
		var male = 0;
		var female = 0;
		self.population.forEach(function (person) {
			if (person.gender == 'male') {
				male++;
			} else {
				female++;
			}
		});
		console.log('males: ' + male);
		console.log('females: ' + female);
		//=========
		// regional cities
		//=========
		var familyIndex = 0;
		while (self.families.length > 0) {
			var city = new City();
			for (familyIndex; familyIndex < self.families.length+1; familyIndex++) {
				
				// add more families to this city
				if (familyIndex < self.families.length && city.population.length < Config.maxPopulation) {
					var family = self.families[familyIndex];
					city.families.push(family);
					family.father.city = city;
					city.population.push(family.father);
					family.mother.city = city;
					city.population.push(family.mother);
					// if the children aren't married they live with their parents
					family.children.forEach(function (child) {
						if (child.spouse === null) {
							child.city = city;
							city.population.push(child);
						}
					});
					self.families.remove(familyIndex);
					familyIndex--;
				} else {
					// finish this city
					city.initialize();
					// create a mayor
					var mayor;
					do {
						mayor = city.population.random();
					} while (mayor.age < 30)
					mayor.profession = 'mayor';
					mayor.workPlace = city.buildings[0];
					// create a sheriff
					var sheriff;
					do {
						sheriff = city.population.random();
					} while (sheriff.id == mayor.id || sheriff.age < 30)
					sheriff.profession = 'sheriff';
					sheriff.workPlace = city.buildings[0];
					break;
				}
			};
			self.cities.push(city);
		}
		self.population = [];
	}
	this.initialize = function () {
		var self = this;
		var body = document.getElementById('body');
		// generate the world
		self.generate();
		// create the HTML elements
		
		// main
		self.main = document.createElement('DIV');
		self.main.className = 'main';
		
		// time
		self.time = document.createElement('DIV');
		self.time.className = 'group';
		self.time.style.width = '20%';
		self.time.style.textAlign = 'center';
		self.clock = new Clock(self.time);
		self.clock.start(200);
		
		// quest tracker
		self.quests = document.createElement('OL');
		self.quests.className = 'button';
		self.quests.innerHTML = 'Quests';

		// Places
		self.places = document.createElement('TD');
		self.places.className = 'group';
		self.places.style.textAlign = 'center';
		self.places.innerHTML = 'Places';

		// People
		self.people = document.createElement('TD');
		self.people.className = 'group';
		self.people.style.textAlign = 'center';
		self.people.innerHTML = 'People';
		
		// person screen
		self.person = document.createElement('DIV');
		self.person.className = 'group';
		self.person.style.width = 'auto';
		
		// Things
		self.things = document.createElement('TD');
		self.things.className = 'group';
		self.things.style.textAlign = 'center';
		self.things.innerHTML = 'Things';
		
		// scene description
		self.scene = document.createElement('DIV');
		self.scene.className = 'group';
		self.scene.innerHTML = 'Scene';
		
		// table
		self.table = document.createElement('TABLE');
		self.table.className = 'table';
		var row = document.createElement('TR');
		row.appendChild(self.places);
		row.appendChild(self.people);
		row.appendChild(self.things);
		self.table.appendChild(row);
		self.main.appendChild(self.table);
		
		
		// append everything to the body
		body.appendChild(self.main);
		
		// start the game
		self.interactionScreen();
		self.createScene();
	}
	this.interactionScreen = function () {
		var self = this;
		self.clearElements(self.main);
		self.main.appendChild(self.time);
		self.main.appendChild(self.quests);
		self.main.appendChild(self.scene);
		self.main.appendChild(self.table);
		
	}
	this.personScreen = function () {
		var self = this;
		self.clearElements(self.main);
		self.main.appendChild(self.person);
	}
	this.questScreen = function () {
		var self = this;
		self.clearElements(self.main);
	}
}
// Player class
function Player(name,gender,age,bio) {
	//=======
	// public
	//=======
	//=======
	// private
	//=======
	this.name = '';
	this.description = '';
	this.gender = '';
	this.age;
	this.city = null;
	this.building = null;
	this.room = null;
	this.person = null;
	this.bio = '';
	this.quests = [];
	this.inventory = [];
	
	this.initialize = function (name,gender,age,bio) {
		var self = this;
		self.name = name;
		self.gender = gender;
		self.age = age;
		self.bio = bio;
	}
	// initialize
	this.initialize(name,gender,age,bio);
}
// City class
function City() {
	//=======
	// public
	//=======
	
	// move everyone to their workplace
	this.commuteWork = function () {
		var self = this;
		// pull people out of buildings
		var population = self.returnPopulation();
		// put people in their workplace
		while (population.length >0) {
			var person = population.shift();
			if (person.workPlace instanceof Building) {
				// professional work building
				person.workPlace.rooms[0].population.push(person);
			} else {
				// otherwise send them home
				person.home.rooms[0].population.push(person);
			}
		}
	}
	this.commuteHome = function () {
		var self = this;
		// pull people out of buildings
		var population = self.returnPopulation();
		// put people in their home
		while (population.length >0) {
			var person = population.shift();
			person.home.rooms[0].population.push(person);
		}
	}
	// shuffle each building's population
	this.shufflePopulation = function () {
		var self = this;
		self.buildings.forEach(function (building) {
			building.shufflePopulation();
		})
	}
	// remove and return the city's population
	this.returnPopulation = function () {
		var self = this;
		var population = self.population;
		self.buildings.forEach(function (building) {
			population = population.concat(building.returnPopulation());
			self.population = [];
		});
		return population;
	}
	this.initialize = function () {
		var self = this;
		// name
		self.name = NameGenerator.city();
		// create court house for mayor and sheriff
		self.buildings.push(new Building('court house',self.name + ' ' + Config['court house'].name.random()));
		// create buildings for all professions
		Config.professions.forEach(function (profession) {
			// blacklist certain professions
			if (profession.data != 'warrior' && profession.data != 'farmer') {
				var workers = 0;
				var building;
				self.population.forEach(function (person,index) {
					if (person.profession === profession.data) {
						workers++;
						// create a building for every 4 people that have the same profession
						if ((workers-1) %  4 == 0) {
							var name;
							switch (person.profession) {
								case 'doctor': name = self.name + ' ' + Config[profession.data].name.random(); break;
								case 'clergy': name = Config[profession.data].name.random(); break;
								default: name = person.surname + ' ' + Config[profession.data].name.random();
							}
							building = new Building(profession.data,name);
							self.buildings.push(building);
						}
						// set the person's workPlace
						person.workPlace = building;
					}
				});
			}
		});
		// create one home for each family
		self.families.forEach(function (family) {
			var home = new Building('home', family.surname + ' ' + Config['home'].name.random());
			self.buildings.push(home);
			family.father.home = home;
			family.mother.home = home;
			// if the children aren't married they live with their parents
			family.children.forEach(function (child) {
				if (child.spouse === null) {
					child.home = home;
				}
			});
		});
		// set farmer and warrior's workplaces
		self.population.forEach(function (person) {
			if (['farmer', 'warrior'].indexOf(person.profession) != -1) {
				person.workPlace = person.home;
			}
		});
	}
	//=======
	// private
	//=======
	this.id = game.newId();
	this.name = '';
	this.description = '';
	this.population = [];
	this.families = [];
	this.buildings = [];
}
// Building class
function Building(type,name) {
	//=======
	// public
	//=======
	
	// shuffle the people among the rooms
	this.shufflePopulation = function () {
		var self = this;
		// pull people out of rooms
		var population = self.returnPopulation();
		// put people evenly in rooms
		var roomIndex = 0;
		while (population.length > 0) {
			self.rooms[roomIndex].population.push(population.shift());
			if (roomIndex < self.rooms.length-1) {
				roomIndex++;
			} else {
				roomIndex = 0;
			}
		}
	}
	// remove and return the building's population
	this.returnPopulation = function () {
		var self = this;
		var population = [];
		self.rooms.forEach(function (room) {
			population = population.concat(room.population);
			room.population = [];
		});
		return population;
	}
	//=======
	// private
	//=======
	this.id = game.newId();
	this.name = name;
	this.description = '';
	this.type = type;
	this.rooms = [];
	this.owner;
	this.initialize = function () {
		var self = this;
		self.rooms.push(new Room(probability(Config[self.type].firstRoom).name,self.type,true)); // first room
		// necessary rooms
		for (var room in Config[self.type].rooms) {
			self.rooms.push(new Room(room,self.type));
		}
	}
	// initialize
	this.initialize();
}
// Room class
function Room (name,buildingType,first) {
	//=======
	// public
	//=======
	//=======
	// private
	//=======
	this.id = game.newId();
	this.name = name;
	this.description = '';
	this.population = [];
	this.initialize = function (buildingType,first) {
		var self = this;
		if (first === true) {
			Config[buildingType].firstRoom.some(function (room) {
				if (room.data.name === self.name) {
					self.description = room.data.description.random();
					return true;
				}
			})
			
		} else {
			self.description = Config[buildingType].rooms[self.name].description.random();
		}
	}
	// initialize
	this.initialize(buildingType,first);
}
// Family class
function Family (father,mother) {
	//=======
	// public
	//=======
	
	//=======
	// private
	//=======
	this.father = father;
	this.mother = mother;
	this.children = [];
	this.surname = father.surname;
}
// Person class
function Person (gender,age,profession,surname) {
	//=======
	// public
	//=======
	this.hasSpouse = function () {
		if (this.spouse instanceof Person) {
			return true;
		}
		return false;
	}
	this.hasProfession = function () {
		if (this.profession != 'none' && this.workPlace instanceof Building) {
			return true;
		}
		return false;
	}
	this.fullName = function () {
		return this.name + ' ' + this.surname;
	}
	//=======
	// private
	//=======
	this.id = game.newId();
	this.name = '';
	this.surname = surname;
	this.spouse = null;
	this.children = [];
	this.description = '';
	this.gender = gender;
	this.age = age;
	this.biography = '';
	this.profession = profession;
	this.workPlace = null;
	this.home = null;
	this.state = 'idle';
	this.city;
	this.quests = [];
	this.inventory = [];
	this.genBio = function () {
		var self = this;
		var bio = '';
		// add more to the bio the older the person is
		if (self.age >= 20) {
			
			if (self.age >= 40) {
				if (self.age >= 60) {
					
				}
			}
		}
		return bio;
	}
	this.initialize = function () {
		var self = this;
		self.name = NameGenerator[gender]();
		self.biography = self.genBio();
	}
	// initialize
	this.initialize();
}
// Quest class
function Quest() {
	//=======
	// public
	//=======
	
	//=======
	// private
	//=======
	this.description
	this.initialize = function () {
		
	}
	// initialize
	this.initialize();
}
function Clock(time,callback) {
	//=======
	// public
	//=======
	this.start = function (delay) {
		var self = this;
		self.interval = window.setInterval(function () {
			self.minute++;
			if (self.minute >= 60) {
				self.minute = 0;
				self.hour++;
				if (self.hour >= 25) {
					self.hour = 1;
				}
			}
			// display the time
			if (self.timeDisplay instanceof HTMLElement) {
				self.timeDisplay.innerHTML = self.time();
			}
			// update the population
			game.managePopulation();
		}, delay);
	}
	this.time = function () {
		return (this.hour > 12? this.hour-12: this.hour)+ ':' + (this.minute < 10 ? '0' + this.minute: this.minute) + ' ' + (this.hour == 24 || this.hour < 12 ? 'AM' : 'PM');	
	}
	//=======
	// private
	//=======
	this.timeDisplay = time;
	this.hour = 6;
	this.minute = 59;
	this.second = 0;
	
	this.interval;
}
function randWithin(min,max) {
	return Math.round(Math.random() * (max-min) + min);
}
Array.prototype.remove = function (index) {
	// swap
	var temp = this[index];
	this[index] = this[this.length-1];
	this[this.length-1] = temp;
	// pop
	this.pop();
	return temp;
}
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
// return a value based on a set of probabilities
function probability (data) {
	var answer = null;
	while (answer === null) {
		var counts = [];
		for (var i = 0; i < 5; i++) {
			
			data.forEach(function (option,index) {
				if (counts.length-1 < index) {
					counts.push(0);
				}
				if (Math.random() <= option.probability) {
					counts[index] ++;
				}
			});
		}
		var max = Math.max(...counts);
		counts.some(function (count, index) {
			if (count == max) {
				answer = data[index].data;
				return true;
			}
		});
	}
	return answer;
}
// return true based on probability
function chance (probability) {
	if (Math.random() <= probability) {
		return true;
	}
	return false;
}
// return one element of the array
Array.prototype.random = function  () {
	return this[randWithin(0,this.length-1)];
}
// check for a match
Array.prototype.searchProperty = function(propertyName, property) {
	for (var i = 0; i < this.length; i++) {
		if (this[i][propertyName] === property) {
			return true;
		}
	}
	return false;
}
// shuffle
Array.prototype.shuffle = function () {
  var currentIndex = this.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = this[currentIndex];
    this[currentIndex] = this[randomIndex];
    this[randomIndex] = temporaryValue;
  }
}
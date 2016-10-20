// This is a test to see how well the Diamond-Square algorithm works for distribution maps based on height values
// canvas

var canvas = document.getElementById('mainCanvas')
var ctx = canvas.getContext('2d');

// image interpolation off for IE, Chrome, Firefox
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
function Setting(maxDeviation,deviationDecrease,zoom,mountain) {
	this.maxDeviation = maxDeviation;
	this.deviationDecrease = deviationDecrease;
	this.zoom = zoom;
	this.mountain = mountain;
}
var mapWidth = canvas.width;
var maxHeight = 255;
var distMap;
var infoBar = document.getElementById("infoBar");
function genDistMap() {
	// generate
	distMap = algorithm(new Setting(
	document.getElementById('maxDeviation').value,
	document.getElementById('deviationDecrease').value,
	document.getElementById('zoom').value,
	document.getElementById('mountain').checked
	));
	render(distMap,document.getElementById('numOfColors').value,document.getElementById('transparent').checked,document.getElementById('greyScale').checked)
}
function reRender() {
	render(distMap,document.getElementById('numOfColors').value,document.getElementById('transparent').checked,document.getElementById('greyScale').checked)
}
function render(points,numOfColors,transparent,grayScale) {
	// render
	var percent = 255/numOfColors;
	var alpha = transparent? 0.5: 1; 
	points.forEach(function (column,x) {
		column.forEach(function (point,y) {
			if (grayScale) {
				var shade = Math.floor(point/percent)*percent;
				ctx.fillStyle = 'rgba(' + Math.round(shade) + ',' + Math.round(shade) + ',' + Math.round(shade) + ',' + alpha + ')';
			} else {
				var shade = (Math.floor(point/percent)*percent/255)*Math.PI*2
				var r = Math.cos(shade-Math.PI/2)*255
				var g = Math.cos(shade-Math.PI)*255
				var b = Math.cos(shade-(3*Math.PI/2))*255
				ctx.fillStyle = 'rgba(' + Math.round(r>0?r:0) + ',' + Math.round(g>0?g:0) + ',' + Math.round(b>0?b:0) + ',' + alpha + ')';
			}
			if (point > maxHeight) {ctx.fillStyle = 'white'} else if (point < 0) {ctx.fillStyle = 'black'}
			ctx.fillRect(x,y,1,1);
		})
	})
}
// create and return the data set
function algorithm (setting,continentMap,biomeMap) {
	var continent = continentMap!=undefined && biomeMap!=undefined;
	var points = [];
	for (var i = 0; i <= canvas.height; i++) {
		points[i] = new Array(mapWidth);
	}
	// initialize the corners
	var corners = continent||setting.mountain?0:maxHeight/2;
	points[0][0] = corners;
	points[mapWidth][0] = corners;
	points[0][canvas.height] = corners;
	points[mapWidth][canvas.height] = corners;
	var maxDeviation = setting.maxDeviation
	for (var iteration=0;iteration<Math.floor(Math.log2(mapWidth));iteration++) {
		var gridWidth = mapWidth/Math.pow(2,iteration);
		for (var x = 0; x < mapWidth-1; x+=gridWidth) {
			for (var y = 0; y < mapWidth-1; y+=gridWidth) {
				// Diamond
				var zValue;
				point = {x:Math.ceil(x+Math.floor(gridWidth)/2),y:Math.ceil(y+Math.floor(gridWidth)/2)};
				if (continent) {
					if (iteration <= setting.zoom) {
						if (continentMap[point.x][point.y] > maxHeight/2) {
							// the 0.5 below flattens the part of the continent above sea
							zValue = ((continentMap[point.x][point.y]-maxHeight/2)*0.5)+maxHeight/2+deviation(biomeDeviation(biomeMap[point.x][point.y],iteration,setting.zoom)) + 128*Math.pow(Math.E,-((biomeMap[point.x][point.y]-128)*(biomeMap[point.x][point.y]-128))/2592);
						} else {
							zValue = continentMap[point.x][point.y]
						}
					} else {
						if (continentMap[point.x][point.y] > maxHeight/2) {
							zValue = setting.mountain && iteration == 0?255:Math.round((points[x][y]+points[x+Math.floor(gridWidth)][y]+points[x][y+Math.floor(gridWidth)]+points[x+Math.floor(gridWidth)][y+Math.floor(gridWidth)])/4)+deviation(biomeDeviation(biomeMap[point.x][point.y],iteration,setting.zoom));	
						} else {
							zValue = continentMap[point.x][point.y]
						}
					}
				} else {
					zValue = setting.mountain && iteration == 0?255:Math.round((points[x][y]+points[x+Math.floor(gridWidth)][y]+points[x][y+Math.floor(gridWidth)]+points[x+Math.floor(gridWidth)][y+Math.floor(gridWidth)])/4)+deviation(maxDeviation);
				}
				points[point.x][point.y] = zValue;
				// Square
				square(points,Math.ceil(x+Math.floor(gridWidth)/2),y,Math.floor(gridWidth)/2,corners,maxDeviation,continent,iteration,continentMap,biomeMap,setting)
				square(points,x,Math.ceil(y+Math.floor(gridWidth)/2),Math.floor(gridWidth)/2,corners,maxDeviation,continent,iteration,continentMap,biomeMap,setting)
				square(points,x+Math.floor(gridWidth),Math.ceil(y+Math.floor(gridWidth)/2),Math.floor(gridWidth)/2,corners,maxDeviation,continent,iteration,continentMap,biomeMap,setting)
				square(points,Math.ceil(x+Math.floor(gridWidth)/2),y+Math.floor(gridWidth),Math.floor(gridWidth)/2,corners,maxDeviation,continent,iteration,continentMap,biomeMap,setting)
			}
		}
		// decrease the random deviation range
		if (iteration >= setting.zoom) {
			maxDeviation -= setting.deviationDecrease*maxDeviation
		}
	}
	return points;
}
function square(points,x,y,width,edge,maxDeviation,continent,iteration,continentMap,biomeMap,setting) {
	var zValue;
	var onEdge = x==0||x==mapWidth||y==0||y==mapWidth	
	if (continent) {
		if (iteration <= setting.zoom) {
			if (continentMap[x][y] > maxHeight/2) {
				zValue = ((continentMap[x][y]-maxHeight/2)*0.5)+maxHeight/2+deviation(biomeDeviation(biomeMap[x][y],iteration,setting.zoom)) + 128*Math.pow(Math.E,-((biomeMap[x][y]-128)*(biomeMap[x][y]-128))/2592);
			} else {
				zValue = continentMap[x][y]
			}
		} else {
			if (continentMap[x][y] > maxHeight/2) {
				zValue = onEdge? edge: Math.round((points[Math.floor(x-width)][y]+points[x][Math.floor(y-width)]+points[Math.floor(x+width)][y]+points[x][Math.floor(y+width)])/4+deviation(biomeDeviation(biomeMap[x][y],iteration,setting.zoom)));
			} else {
				zValue = continentMap[x][y]
			}
		}
	} else {
		zValue = onEdge? edge: Math.round((points[Math.floor(x-width)][y]+points[x][Math.floor(y-width)]+points[Math.floor(x+width)][y]+points[x][Math.floor(y+width)])/4+deviation(maxDeviation));
	}
	points[x][y] = zValue;
}
function biomeDeviation(zValue,iteration,zoom) {
	var initialDeviation = 128*Math.pow(Math.E,-((zValue-128)*(zValue-128))/2592);
	var deviationDecrease = Math.abs(-1*Math.pow(Math.E,-((zValue-128)*(zValue-128))/2592)-0.1);
	var maxDeviation = initialDeviation*Math.pow(deviationDecrease,iteration-zoom);
	if (maxDeviation > initialDeviation) {
		maxDeviation = initialDeviation;
	}
	return maxDeviation;
}

//genDistMap();
genContinent();

//=====================
// Continent Generation
//=====================

function genContinent() {
	var continentMap = algorithm(new Setting(255,0.5,2,true));
	var biomeMap = algorithm(new Setting(255,0.9,4,false));
	var mesh = algorithm(new Setting(8,0.7,7,false),continentMap,biomeMap)
	// rivers
	var rivers = [];
	for (var i = 0; i<1; i++ ) {
		var start, end;
		while (true) {
			var test = new Vec2(randBetween(0,mapWidth),randBetween(0,mapWidth));
			if (mesh[test.x][test.y] >= 192) {
				start = test;
				break;
			}
		}
		while (true) {
			var test = new Vec2(randBetween(0,mapWidth),randBetween(0,mapWidth));
			if (mesh[test.x][test.y] <= 128 && mesh[test.x][test.y] >= 110) {
				end = test;
				break;
			}
		}
		rivers.push(new River(start,end,mesh));
		// create a valley along the river
		/* var points = rivers[i].points;
		points.forEach(function (point,index) {
			if (index != points.length-1) {
				mesh.forEach(function (column,x) {
					column.forEach(function (vertex,y) {
						var midPoint = new Vec2(point.x+(point.x-points[index+1].x)/2,point.y+(point.y-points[index+1].y)/2)
						if (x>midPoint.x-64&&x<midPoint.x+64&&y>midPoint.y-64&&y<midPoint.y+64) {
							mesh[x][y] = valley(new Vec3(x,y,mesh[x][y]),point,points[index+1],2*Math.PI/5)
						}
					})
				})
			}
		}) */
	}
	// cities
	var cities = [];
	for (var i = 0; i<20;i++) {
		while (true) {
			var x = randBetween(0,mapWidth);
			var y = randBetween(0,mapWidth);
			if (mesh[x][y] > 128 && biomeDeviation(biomeMap[x][y],0,0) < 16) {
				cities.push(new City(x,y))
				break;
			}
		}
	}
	// roads
	var roads = [];
	// start linking the road networks
	for (var links = 0; links < cities.length-1;links++) {
		var probes = [new Probe(0,0)];
		var network = [0];
		// find all the points in the main network
		while (probes.length > 0) {
			var add = [];
			probes.forEach(function (probe) {
				cities.forEach(function (city, index) {
					if (city.roads.indexOf(probe.end) != -1 && index != probe.start) {
						network.push(index);
						city.roads.forEach(function (node) {
							if (node != probe.end) {
								add.push(new Probe(index,node))
								network.push(node);
							}
						})
					}
				})
			})
			// add new probes
			probes = add;
		}
		// connect the network to a nearby city
		var distance = 1024;
		var shortest = [];
		network.forEach(function (city) {
			cities.forEach(function (near,nearIndex) {
				if (network.indexOf(nearIndex) == -1) {
					var a = near.x-cities[city].x;
					var b = near.y-cities[city].y;
					var c = Math.round(Math.sqrt(a*a+b*b)) 
					if (c < distance) {
						shortest[0] = nearIndex;
						shortest[1] = city;
						distance = c;
					}
				}
			})
		})
		// create the road
		cities[shortest[0]].roads.push(shortest[1]);
		cities[shortest[1]].roads.push(shortest[0]);
		roads.push(new Road(shortest[0],shortest[1],cities))
	}
	
	//==========
	// Rendering
	//==========
	render(mesh,32,false,true);
	// the mesh
	var area = 0;
	mesh.forEach(function (column,x) {
		column.forEach(function (point,y) {
			if (point >= 128) {area++;}
			var fillStyle;
			if (point < 128) {
				// water
				fillStyle = 'rgba(0,0,255,0.5)';
			} else if (point >= 128 && point < 130) {
				// beach
				fillStyle = 'rgba(204, 153, 0,0.5)';
			} else if (point >= 130 && point < 200) {
				// grass
				fillStyle = 'rgba(0, 128, 0,0.5)';
			} else if (point >= 200 && point < 240) {
				// dirt
				fillStyle = 'rgba(102, 51, 0,0.5)';
			} else if (point >= 240 && point < 280) {
				// stone
				fillStyle = 'rgba(128, 128, 128,0.5)';
			} else {
				// snow
				fillStyle = 'rgba(255, 255, 255,0.5)';
			}
			ctx.fillStyle = fillStyle;
			ctx.fillRect(x,y,1,1);
		})
	})
	document.getElementById('infoBar').innerHTML = 'Area: ' + area + ' pixels';
	// rivers
	ctx.strokeStyle = 'blue';
	rivers.forEach(function (river) {
		ctx.beginPath();
		ctx.moveTo(river.points[0].x,river.points[0].y)
		river.points.forEach( function (point) {
			ctx.lineTo(point.x,point.y);
		})
		ctx.stroke();
	})
	// roads
	ctx.strokeStyle = 'black';
	roads.forEach(function (road) {
		ctx.beginPath();
		ctx.moveTo(road.points[0].x,road.points[0].y)
		road.points.forEach( function (point) {
			ctx.lineTo(point.x,point.y);
		})
		ctx.stroke();
	})
	// cities
	cities.forEach(function (city) {
		ctx.beginPath();
		ctx.arc(city.x,city.y,city.size,0,2*Math.PI);
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.strokeStyle = 'black';
		ctx.stroke();
	}) 
}
function River (start,end,continentMap) {
	var points = midPointDisplacement(start,end,5,new Setting(32,0.7,1,false));
	points.forEach(function (point,index) {
		points[index] = new Vec3(point.x,point.y,135/*continentMap[point.x][point.y]-64*/)
	})
	this.points = points;
	this.start = points[0];
	this.end = points[points.length-1];
	
}
function City (x,y) {
	this.x = x;
	this.y = y;
	this.size = randBetween(2,4);
	this.roads = [];
}
function Road(start,end,cities) {
	this.nodes = [start,end];
	this.points = midPointDisplacement(new Vec2(cities[start].x,cities[start].y),new Vec2(cities[end].x,cities[end].y),4,new Setting(6,0.8,1,false))
}
function Probe(start,end) {
	this.start = start;
	this.end = end;
}
//========
// Utility
//========

function midPointDisplacement(start,end,iterations,setting) {
	var maxDeviation = setting.maxDeviation;
	var points = new Array(Math.pow(2,iterations)+1);
	points[0] = 0;
	points[points.length-1] = 0;
	for (var iteration = 0; iteration < iterations; iteration++) {
		var length = (points.length-1)/Math.pow(2,iteration);
		for (var x = 0; x < points.length-1; x += length) {
			points[x+length/2] = Math.round((points[x]+points[x+length])/2 + deviation(maxDeviation));
		}
		// decrease the random deviation range
		if (iteration >= setting.zoom) {
			maxDeviation -= setting.deviationDecrease*maxDeviation
		}
	}
	// create vectors perpendicular to slope
	var vectors = [];
	var slope = -1*(end.x-start.x)/(end.y-start.y);
	points.forEach(function (amplitude,index) {
		var point0 = new Vec2(start.x+((end.x-start.x)/(points.length-1))*index,start.y+((end.y-start.y)/(points.length-1))*index);
		var x,y;
		if (slope === Infinity) {
			y = point0.y+amplitude;
			x = point0.x;
		} else {
			x = point0.x+(amplitude/Math.sqrt(1+slope*slope));
			y = slope*(x-point0.x) + point0.y;
		}
		vectors.push(new Vec2(Math.round(x),Math.round(y)));
		
	})
	return vectors;
}
function randBetween (min,max) {
	return Math.round((Math.random()*(max-min))+min);
}
function deviation(maxDeviation,upwards) {
	return upwards != true? Math.round(Math.random()*maxDeviation-maxDeviation/2): Math.round(Math.random()*maxDeviation);
}
function Vec2(x,y) {
	this.x = x;
	this.y = y;
}
function Vec3(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
}
function valley(point,start,end,angle) {
	var slope = (end.y-start.y)/(end.x-start.x);
	var incline = (end.z-start.z)/(end.x-start.x);
	if (typeof incline !== 'number') {
		incline = 0;
	}
	var perpendicular = slope == Infinity? 0:-1/slope;
	var x,y,z;
	if (slope == Infinity) {
		x = start.x;
		y = point.y;
	} else if (perpendicular == Infinity) {
		x = point.x;
		y = start.y;
	} else {
		x = (-(point.x*perpendicular)+(start.x*slope)+(point.y-start.y))/(slope-perpendicular);
		y = (x-start.x)*slope + start.y;
	}
	z = (x-start.x)*incline + start.z;
	var intersection = new Vec3(x,y,z);
	if ((intersection.x <=start.x&&intersection.x<=end.x&&intersection.y<=start.y&&intersection.y<=end.y)||(intersection.x >=start.x&&intersection.x>=end.x&&intersection.y>=start.y&&intersection.y>=end.y)) {
		if (pythag(intersection.x-start.x,intersection.y-start.y)<pythag(intersection.x-end.x,intersection.y-end.y)) {
			intersection = start;
		} else {
			intersection = end;
		}
	}
	var distance = pythag(point.x-intersection.x,point.y-intersection.y);
	var height = distance * Math.tan(angle)+intersection.z;
	return height > point.z||distance >48? point.z: height;
}
function pythag(i1,i2,i3) {
	var x = i1 != undefined? i1:0;
	var y = i2 != undefined? i2:0;
	var z = i3 != undefined? i3:0;
	return Math.sqrt(x*x+y*y+z*z);
}
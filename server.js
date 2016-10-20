//node "c:/gage omega/programming/logical expression/server.js"

var port = 8080;
var serverUrl = "192.168.1.41";

//Lets require/import the HTTP module
var http = require('http');
var path = require("path"); 
var fs = require("fs"); 
var dispatcher = require('httpdispatcher');

//Lets define a port we want to listen to
const PORT=8080; 

//Lets use our dispatcher
function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Dispatch
        //dispatcher.dispatch(request, response);
		// request resources
		debugger;
		var now = new Date();
		var filename = request.url.slice(-1) == "/" ? "/index.html" : request.url;
		filename = filename.replace("%20"," ");
		var ext = path.extname(filename);
		var localPath = "c:/Gage Omega/Programming/Logical Expression";
		var validExtensions = {
			".html" : "text/html",			
			".js": "application/javascript", 
			".css": "text/css",
			".txt": "text/plain",
			".jpg": "image/jpeg",
			".gif": "image/gif",
			".png": "image/png",
			".ico": "image/icon"
		};
		var isValidExt = validExtensions[ext];

		if (isValidExt) {
			localPath += filename;
			fs.stat(localPath, function(err,stat) {
				if(err == null) {
					console.log("Serving file: " + localPath);
					getFile(localPath, response, isValidExt);
				} else {
					console.log("File not found: " + localPath);
					response.writeHead(404);
					response.end();
				}
			});

		} else {
			console.log("Invalid file extension detected: " + ext)
		}
    } catch(err) {
        //handle errors gracefully
		sys.puts(err);
		res.writeHead(500);
		res.end('Internal Server Error');
    }
}

function getFile(localPath, res, mimeType) {
	fs.readFile(localPath, function(err, contents) {
		if(!err) {
			res.setHeader("Content-Length", contents.length);
			res.setHeader("Content-Type", mimeType);
			res.statusCode = 200;
			res.end(contents);
		} else {
			res.writeHead(500);
			res.end();
		}
	});
}
//For all your static (js/css/images/etc.) set the directory name (relative path).
dispatcher.setStatic('/');

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

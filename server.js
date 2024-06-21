const express = require('express');
var multer  = require('multer');
var path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');

const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use('/static', express.static('static'));
app.use('/media', express.static('media'));

// app.get('/:id', function(req, res){
// 	res.sendFile(path.join(__dirname, '/' + req.params.id + '.html'))
// });

app.get('/:id', (req, res) => {
	let idx = Number(req.params.id)
	// res.send('/' + req.params.id + '.html')
	if(idx < 6 && idx > 0){
		res.sendFile(__dirname + '/' + req.params.id + '.html')
	}
	else{
		res.sendFile(path.join(__dirname, '/404.html'))
	}
});


// UPGRADE TOOLS
app.get("/upgrade", (req, res) => {
  res.sendFile(__dirname + '/upgrade.html');
});

var storage = multer.diskStorage({
  destination: __dirname,
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ 
	storage: storage,
	fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.zip') {
            return callback(new Error('Only zip files are allowed'))
        }
        callback(null, true)
    }
}).single('zippy');

app.post('/upload', function (req, res) {
	try {
	  fs.unlinkSync(path.join(__dirname, req.file.filename))
	} catch(err) {
	  console.error(err)
	}
   	upload(req, res, function (err) {
	    if (err instanceof multer.MulterError) {
	    	res.send({
		        status: false,
		        message: 'UNKNOWN ERROR'
		    });
	    } 
	    else if (err) {
	      res.send({
		        status: false,
		        message: 'ZIP Files Only!'
		    });
	    }
	    // OK TO UNZIP
	    else {
	    	// console.log(req.file.filename);
	    	fs.createReadStream(path.join(__dirname, req.file.filename))
	    	.pipe(unzipper
	    		.Extract({ path: __dirname })
	    		.on('close', () => {
	    			try {
					  fs.unlinkSync(path.join(__dirname, req.file.filename))
					} catch(err) {
					  console.error(err)
					}
    				res.send({
			        status: true,
			        message: 'System will restart'
				    });
				    require('child_process').exec(
				    	'sudo /sbin/reboot', function(msg){console.log(msg)}
				    );
    			})
	    	);
	    }
   	});
});



// RUN SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});

function loadFile(url, data, callback, errorCallback) {
    // Set up an asynchronous request
    var request = new XMLHttpRequest();
    request.open('GET', url, false);

    // Hook the event that gets called as the request progresses
    request.onreadystatechange = function () {
        // If the request is "DONE" (completed or failed)
        if (request.readyState == 4) {
            // If we got HTTP status 200 (OK)
            if (request.status == 200) {
                callback(request.responseText, data)
            } else { // Failed
                errorCallback(url);
            }
        }
    };

    request.send(null);    
}

function loadFiles(urls, callback, errorCallback) {
    var numUrls = urls.length;
    var numComplete = 0;
    var result = [];

    // Callback for a single file
    function partialCallback(text, urlIndex) {
        result[urlIndex] = text;
        numComplete++;

        // When all files have downloaded
        if (numComplete == numUrls) {
            callback(result);
        }
    }

    for (var i = 0; i < numUrls; i++) {
        loadFile(urls[i], i, partialCallback, errorCallback);
    }
}

var gl;

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }



    function getShader(gl, id, text) {
        var shaderScript = text
        if (!shaderScript) {
            return null;
        }

        var shader;
        if (id == "f") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (id == "v") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, text);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }


    var shaderProgram;

    function initShaders() {
    	var vertexShader;
    	var fragmentShader;
    	
    	loadFiles([SHADER_DIR + 'texture.vs', SHADER_DIR + 'texture.fs'], function (shaderText) {
		    vertexShader = getShader(gl, "v", shaderText[0]);
		    // ... compile shader, etc ...
		    fragmentShader = getShader(gl, "f", shaderText[1]);
		
		    // ... set up shader program and start render loop timer
		}, function (url) {
		    alert('Failed to download "' + url + '"');
		}); 
    	
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    }

    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }


    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
	
	function createOrtho2D(left,right,bottom,top) {
	    var near = -1, far = 1, rl = right-left, tb = top-bottom, fn = far-near;
	    return [        2/rl,                0,              0,  0,
	                       0,             2/tb,              0,  0,
	                       0,                0,          -2/fn,  0,
	        -(right+left)/rl, -(top+bottom)/tb, -(far+near)/fn,  1];
	}

	var currentlyPressedKeys = {};

    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
    }


    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }

    function handleKeys() {
    	//else if prevents diagonal movements
        if (currentlyPressedKeys[38]) {
            // Up cursor key
            playerone.PosY -= 2;
            playerone.Rotate = 0;
        }
        else if (currentlyPressedKeys[40]) {
            // Down cursor key
            playerone.PosY += 2;
            playerone.Rotate = 180;
        }
        else if (currentlyPressedKeys[37]) {
            // Left cursor key
            playerone.PosX -= 2;
            playerone.Rotate = 270;
        }
        else if (currentlyPressedKeys[39]) {
            // Right cursor key
            playerone.PosX += 2;
            playerone.Rotate = 90;
        }
        
        if (currentlyPressedKeys[32]) {
            playerone.Fire();
        }
    }

	function checkbounds()
	{
		if(playerone.PosX < 25)
		{
			playerone.PosX = 25;
		}
		if(playerone.PosX > gl.viewportWidth - 25)
		{
			playerone.PosX = gl.viewportWidth - 25;
		}
		if(playerone.PosY < 0)
		{
			playerone.PosY = 0;
		}
		if(playerone.PosY > gl.viewportHeight)
		{
			playerone.PosY = gl.viewportHeight;
		}
	}

    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        pMatrix = createOrtho2D(0, gl.viewportWidth, gl.viewportHeight,0);

        mat4.identity(mvMatrix);

		
		background.draw();
		playerone.draw();
		playerone.Arrow.draw();
		
		for (var i in Enemies) {
            Enemies[i].draw();
        }
    }


	function handleLoadedTexture(texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    var lastTime = 0;

    function update() {
        var timeNow = new Date().getTime();
        var elapsed = timeNow - lastTime;
        if (lastTime != 0) {
			//update
			collisiondetection(elapsed);
      		this.playerone.Arrow.update(elapsed);
			for (var i in Enemies) {
            	Enemies[i].update(elapsed);
        	}
        }
        lastTime = timeNow;
    }


	function collisiondetection(elapsed)
	{
		checkbounds();	//keeps player in the bounds of the field
		checkarrowenemy(elapsed);
	}
	
	function checkarrowenemy(elapsed)
	{
		for (var i in Enemies)
		{
			var arrowx = this.playerone.Arrow.PosX;
			var arrowy = this.playerone.Arrow.PosY;
			var enemyx = Enemies[i].PosX;
			var enemyy = Enemies[i].PosY;
			var arrowwidth = this.playerone.Arrow.Width;
			var enemywidth = Enemies[i].Width;
			
			if(((arrowx >= enemyx && arrowx <= enemyx + enemywidth) || 
			(arrowx + arrowwidth >= enemyx && arrowx + arrowwidth <= enemyx+ enemywidth)) &&
			((arrowy >= enemyy && arrowy <= enemyy + enemywidth) || 
			(arrowy + arrowwidth >= enemyy && arrowy + arrowwidth <= enemyy+ enemywidth))){
				Enemies[i].die(elapsed);
			}
		}
	}
	
    function tick() {
        requestAnimFrame(tick);
        handleKeys();
        drawScene();
        update();
    }
    
    function initKeys()
    {
		document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
    	
    }
    
    var playerone;
    var background;
    var Enemies = [];
    
   	function initGame(canvas)
   	{
   		initGL(canvas);
        initShaders();
        
        playerone = new Player();
        background = new Background();
        
        var numEnemies = 100;
        for (var i=0; i < numEnemies; i++) {
        	var enemytemp = new Enemy();
        	enemytemp.PosX = Math.random() * 318 + 41; //times width of canvas minus width of boundaries minus width of texture
            enemytemp.PosY = Math.random() * 100 - 100;
            enemytemp.Speed = Math.random() * 20 + 5;
            Enemies.push(enemytemp);
        }
        
        initKeys();

		

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        tick();   		
   	}
   	
   
    function webGLStart() {
        var canvas = document.getElementById("MainCanvas");
        initGame(canvas);
    }
	
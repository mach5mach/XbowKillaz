function Background() {
	this.PosX = 0;
	this.PosY = 0;	
	
	this.PositionBuffer;
    this.TextureCoordBuffer;
    this.IndexBuffer;
	
	this.Texture;
	
	this.initTexture();
	this.initBuffers();
	
	this.Rotate = 0;
}
                
    Background.prototype.initTexture = function() {
        this.Texture = gl.createTexture();
        this.Texture.image = new Image();
        var tex = this.Texture;	//need to copy in order to pass to onload function
        this.Texture.image.onload = function () {
            handleLoadedTexture(tex)
        }

        this.Texture.image.src = IMG_DIR + 'Background.jpg';
    } 
        
    Background.prototype.draw = function() {
    	mvPushMatrix();
    	//transformation matrices here
		mat4.translate(mvMatrix, [this.PosX, this.PosY, 0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.PositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.PositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.TextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.TextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.Texture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, this.IndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        mvPopMatrix();
    }    
        
    Background.prototype.initBuffers = function() {
	    var z = 0.0;
    	this.PositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.PositionBuffer);
        var vertices = [
            // Front face
             0, 0,  z,
             400, 0,  z,
             400,  600,  z,
             0,  600,  z
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.PositionBuffer.itemSize = 3;
        this.PositionBuffer.numItems = 4;

        this.TextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.TextureCoordBuffer);
        var textureCoords = [
          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        this.TextureCoordBuffer.itemSize = 2;
        this.TextureCoordBuffer.numItems = 4;

        this.IndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexBuffer);
        var VertexIndices = [
            0, 1, 2,      0, 2, 3    // Front face
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(VertexIndices), gl.STATIC_DRAW);
        this.IndexBuffer.itemSize = 1;
        this.IndexBuffer.numItems = 6;
    }

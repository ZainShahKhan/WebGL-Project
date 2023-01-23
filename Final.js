function main() {
    //Get the canvas and WebGL context
    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext("webgl");

    //Send error if WebGL not working
    if (!gl) {
        alert("Your browser does not support WebGL!");
        return;
    }

    //Get the buttons and select list from the HTML file
    var frontE = document.querySelector("#view1");
    var elevOb = document.querySelector("#view2");
    var planOb = document.querySelector("#view3");
    var iso = document.querySelector("#view4");
    var onePerp = document.querySelector("#view5");
    var threePerp = document.querySelector("#view6");

    var drawButton = document.querySelector("#draw-button");
    var shapeSelect = document.querySelector("#select-list");

    //Create a program with the vertex and fragment shaders
    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

    //Get the attribute locations from the program
    var posLoc = gl.getAttribLocation(program, "a_position");
    var norLoc = gl.getAttribLocation(program, "a_normal");

    //Get the uniform locations from the program
    var wldVewProjLoc = gl.getUniformLocation(program, "u_worldViewProjection");
    var wldInvTransLoc = gl.getUniformLocation(program, "u_worldInverseTranspose");
    var clrLoc = gl.getUniformLocation(program, "u_color");
    var revLghDirLoc = gl.getUniformLocation(program, "u_reverseLightDirection");

    //Simple functions for Radians to Degrees
    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    //And Degrees to Radians
    function degToRad(d) {
        return d * Math.PI / 180;
    }

    //Arrays for the default translation, rotation and scaling
    var translation = [150, 180, 0];
    var rotation = [degToRad(45), degToRad(50), degToRad(55)];
    var scale = [100, 100, 100];

    //The array value for the color of the object
    var color = [Math.random(), Math.random(), Math.random(), 1];

    //Field of View in Radians value to be used later
    var fovRad = degToRad(60);

    //Call to the draw scene function to create our object
    drawScene();

    //The setting up of the UI system
    webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePos(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePos(1), max: gl.canvas.height });
    webglLessonsUI.setupSlider("#z", { value: translation[2], slide: updatePos(2), max: gl.canvas.height });
    webglLessonsUI.setupSlider("#angleX", { value: radToDeg(rotation[0]), slide: updateRot(0), max: 360 });
    webglLessonsUI.setupSlider("#angleY", { value: radToDeg(rotation[1]), slide: updateRot(1), max: 360 });
    webglLessonsUI.setupSlider("#angleZ", { value: radToDeg(rotation[2]), slide: updateRot(2), max: 360 });
    webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScl(0), min: 0, max: 1500, step: 5, precision: 2 });
    webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScl(1), min: 0, max: 1500, step: 5, precision: 2 });
    webglLessonsUI.setupSlider("#scaleZ", { value: scale[2], slide: updateScl(2), min: 0, max: 1500, step: 5, precision: 2 });

    //Different functions used to update the value of the translation, rotation and scaling
    //from the UI to the actual value
    function updatePos(index) {
        return function (event, ui) {
            translation[index] = ui.value;
            drawScene();
        };
    }

    function updateRot(index) {
        return function (event, ui) {
            rotation[index] = degToRad(ui.value);
            drawScene();
        };
    }

    function updateScl(index) {
        return function (event, ui) {
            scale[index] = ui.value;
            drawScene();
        };
    }

    //Different functions for the type of projections
    function frontElevation() {
        for (var i = 0; i < 3; i++) {
            translation[i] = 0;
            rotation[i] = degToRad(0);
            scale[i] = 100;
        }
        drawScene();
    }

    function elevationOblique() {
        for (var i = 0; i < 3; i++) {
            translation[i] = 0;
            rotation[i] = degToRad(0);
            scale[i] = 100;
        }
        rotation[0] = degToRad(145);
        rotation[1] = degToRad(140);
        drawScene();
    }

    function planOblique() {
        for (var i = 0; i < 3; i++) {
            translation[i] = 0;
            rotation[i] = degToRad(0);
            scale[i] = 100;
        }
        rotation[0] = degToRad(90);
        drawScene();
    }

    function isometric() {
        for (var i = 0; i < 3; i++) {
            translation[i] = 0;
            rotation[i] = degToRad(0);
            scale[i] = 100;
        }
        rotation[0] = degToRad(140);
        rotation[1] = degToRad(155);
        drawScene();
    }

    function onePointPerspective() {
        for (var i = 0; i < 3; i++) {
            translation[i] = 0;
            rotation[i] = degToRad(0);
            scale[i] = 100;
        }
        rotation[0] = degToRad(20);
        drawScene();
    }

    function threePointPerspective() {
        for (var i = 0; i < 3; i++) {
            translation[i] = 0;
            rotation[i] = degToRad(0);
            scale[i] = 100;
        }
        rotation[0] = degToRad(120);
        rotation[1] = degToRad(155);
        drawScene();
    }

    //Event listeners for all the buttons
    frontE.addEventListener("click", frontElevation);
    elevOb.addEventListener("click", elevationOblique);
    planOb.addEventListener("click", planOblique);
    iso.addEventListener("click", isometric);
    onePerp.addEventListener("click", onePointPerspective);
    threePerp.addEventListener("click", threePointPerspective);

    drawButton.addEventListener("click", drawScene);

    //The draw scene function
    function drawScene() {
        //Create, bind and buffer data for positions
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        setPositions(gl, shapeSelect.selectedIndex);

        //Create, bind and buffer data for normals
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        setNormals(gl, shapeSelect.selectedIndex);

        //Create, bind and buffer data for indices
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        setIndices(gl, shapeSelect.selectedIndex);


        //Resize the canvas
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        //Change the viewport settings
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        //Clear the COLOR_BUFFER_BIT & DEPTH_BUFFER_BIT
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //Enable the DEPTH_TEST
        gl.enable(gl.DEPTH_TEST);
        //Tell the system to use our program
        gl.useProgram(program);

        /* --------------------------------Positions Data and Extraction----------------------------------------- */
        gl.enableVertexAttribArray(posLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

        /* --------------------------------Normals Data and Extraction---------------------------------------------- */

        gl.enableVertexAttribArray(norLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

        gl.vertexAttribPointer(norLoc, 3, gl.FLOAT, false, 0, 0);

        /*---------------------------------------------------------------------------------------------------------- */

        //Create a projection matrix
        var projMat = matrix4Op.perspective(fovRad, (gl.canvas.clientWidth / gl.canvas.clientHeight), 1, 2000);

        //Create a camera position
        var camera = [0, 0, 40];
        //Create a target
        var target = [0, 0, 0];
        //Create a up
        var up = [0, 1, 0];
        //Send to the camera matrix with lookAt
        var camMat = matrix4Op.lookAt(camera, target, up);

        //Inverse the camera matrix and send to view matrix
        var viewMat = matrix4Op.inverse(camMat);

        //Multiply view and projection matrix and send to view projection matrix
        var viewprojMat = matrix4Op.multiply(projMat, viewMat);

        //Compute the world matrix for the object's default settings
        var wldMat = matrix4Op.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
        wldMat = matrix4Op.translate(wldMat, translation[0], translation[1], translation[2]);
        wldMat = matrix4Op.xRotate(wldMat, rotation[0]);
        wldMat = matrix4Op.yRotate(wldMat, rotation[1]);
        wldMat = matrix4Op.zRotate(wldMat, rotation[2]);
        wldMat = matrix4Op.scale(wldMat, scale[0], scale[1], scale[2]);

        //Compute the matrix for the world view matrix
        var wldViewProjMat = matrix4Op.multiply(viewprojMat, wldMat);

        //Compute the matrix for the world inverse transpose matrix
        var wldInvMat = matrix4Op.inverse(wldMat);
        var wldInvTransMat = matrix4Op.transpose(wldInvMat);

        //Send the matrices to the relevant uniform locations
        gl.uniformMatrix4fv(wldVewProjLoc, false, wldViewProjMat);
        gl.uniformMatrix4fv(wldInvTransLoc, false, wldInvTransMat);

        //Set the color array to the uniform color location
        gl.uniform4fv(clrLoc, color);

        //Set the light direction
        gl.uniform3fv(revLghDirLoc, matrix4Op.normalize([0, 0, 0.4]));

        //Create a count variable
        var count = 36;

        //Set the count variable according to the shape selected
        if (shapeSelect.selectedIndex === 0) {
            count = 36;
        } else if (shapeSelect.selectedIndex === 1) {
            count = 18;
        } else if (shapeSelect.selectedIndex === 2) {
            count = 24;
        }

        //Create the object
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
    }
}

//Functions for setting the position, normal and indices
function setPositions(gl, index) {
    //Vertices for Cube
    var cubePos = new Float32Array([
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ]);

    //Vertices for Octahedron
    var octaPos = new Float32Array([
        1, 0, 0, - 1, 0, 0, 0, 1, 0,
        0, - 1, 0, 0, 0, 1, 0, 0, - 1
    ]);

    //Vertices for Pyramid
    var pyrPos = new Float32Array([
        // Front
        -0.5, 0.0, 0.5,
        0.5, 0.0, 0.5,
        0.0, 0.866, 0.0,

        // Right
        0.5, 0.0, 0.5,
        0.5, 0.0, -0.5,
        0.0, 0.866, 0.0,

        // Back
        0.5, 0.0, -0.5,
        -0.5, 0.0, -0.5,
        0.0, 0.866, 0.0,

        // Left
        -0.5, 0.0, -0.5,
        -0.5, 0.0, 0.5,
        0.0, 0.866, 0.0,

        // Base 1 
        -0.5, 0.0, 0.5,
        -0.5, 0.0, -0.5,
        0.5, 0.0, 0.5,

        // Base 2 
        -0.5, 0.0, -0.5,
        0.5, 0.0, -0.5,
        0.5, 0.0, 0.5
    ]);

    //Buffer the data according to the index
    if (index === 0) {
        gl.bufferData(gl.ARRAY_BUFFER, cubePos, gl.STATIC_DRAW);
    } else if (index === 1) {
        gl.bufferData(gl.ARRAY_BUFFER, pyrPos, gl.STATIC_DRAW);
    } else if (index === 2) {
        gl.bufferData(gl.ARRAY_BUFFER, octaPos, gl.STATIC_DRAW);
    } else {
        gl.bufferData(gl.ARRAY_BUFFER, cubePos, gl.STATIC_DRAW);
    }
}

function setNormals(gl, index) {
    //Normals for Cube
    var cubeNorm = new Float32Array([
        // Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ]);

    //Normals for Octahedron
    var octaNorm = new Float32Array([
        1, 0, 0, - 1, 0, 0, 0, 1, 0,
        0, - 1, 0, 0, 0, 1, 0, 0, - 1
    ]);

    //Normals for Pyramid
    var pyrNorm = new Float32Array([
        0, -0.5, 0.866, 0, -0.5, 0.866, 0, -0.5, 0.866,  // Back
        0.866, -0.5, 0, 0.866, -0.5, 0, 0.866, -0.5, 0,  // Left
        0, -0.5, -0.866, 0, -0.5, -0.866, 0, -0.5, -0.866, // Front
        -0.866, -0.5, 0, -0.866, -0.5, 0, -0.866, -0.5, 0,  // Right
        0, 1, 0, 0, 1, 0, 0, 1, 0,         // Base
        0, 1, 0,
    ]);

    //Buffer the data according to the index
    if (index === 0) {
        gl.bufferData(gl.ARRAY_BUFFER, cubeNorm, gl.STATIC_DRAW);
    } else if (index === 1) {
        gl.bufferData(gl.ARRAY_BUFFER, pyrNorm, gl.STATIC_DRAW);
    } else if (index === 2) {
        gl.bufferData(gl.ARRAY_BUFFER, octaNorm, gl.STATIC_DRAW);
    } else {
        gl.bufferData(gl.ARRAY_BUFFER, cubeNorm, gl.STATIC_DRAW);
    }
}

function setIndices(gl, index) {
    //Indices for Cube
    var cubeInd = new Uint16Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23,   // left
    ]);

    //Indices for Octahedron
    var octaInd = new Uint16Array([
        0, 2, 4, 0, 4, 3, 0, 3, 5,
        0, 5, 2, 1, 2, 5, 1, 5, 3,
        1, 3, 4, 1, 4, 2
    ]);

    //Indices for Pyramid
    var pyrInd = new Uint16Array([
        0, 1, 2,    // Front
        3, 4, 5,    // Right
        6, 7, 8,    // Back
        9, 10, 11,  // Left
        12, 13, 14, 15, 16, 17 // Base
    ]);

    //Buffer the data according to the index
    if (index === 0) {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeInd, gl.STATIC_DRAW);
    } else if (index === 1) {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pyrInd, gl.STATIC_DRAW);
    } else if (index === 2) {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, octaInd, gl.STATIC_DRAW);
    } else {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeInd, gl.STATIC_DRAW);
    }
}

//Variable for calling on various Matrix 4 Operations
var matrix4Op = {
    //This function flips the Y axis so 0 is at the top.
    projection: function (width, height, depth) {
        return [
            36 / width, 0, 0, 0,
            0, -36 / height, 0, 0,
            0, 0, 36 / depth, 0,
            -1, 1, 0, 1,
        ];
    },

    //Function which multiplies two matrices
    multiply: function (a, b) {
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    //Basic functions to take values from the program and use them to create a matrix
    translation: function (tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },

    xRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    scaling: function (sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    },

    //Functions used to take the matrix from the previous function and use them to create a output
    //matrix after a certain task
    translate: function (m, tx, ty, tz) {
        return matrix4Op.multiply(m, matrix4Op.translation(tx, ty, tz));
    },

    xRotate: function (m, angleInRadians) {
        return matrix4Op.multiply(m, matrix4Op.xRotation(angleInRadians));
    },

    yRotate: function (m, angleInRadians) {
        return matrix4Op.multiply(m, matrix4Op.yRotation(angleInRadians));
    },

    zRotate: function (m, angleInRadians) {
        return matrix4Op.multiply(m, matrix4Op.zRotation(angleInRadians));
    },

    scale: function (m, sx, sy, sz) {
        return matrix4Op.multiply(m, matrix4Op.scaling(sx, sy, sz));
    },

    //Function to create a transformation matrix using the values given
    perspective: function (fieldOfViewInRadians, aspect, near, far, resultM) {
        resultM = resultM || new Float32Array(16);
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        resultM[0] = f / aspect;
        resultM[1] = 0;
        resultM[2] = 0;
        resultM[3] = 0;
        resultM[4] = 0;
        resultM[5] = f;
        resultM[6] = 0;
        resultM[7] = 0;
        resultM[8] = 0;
        resultM[9] = 0;
        resultM[10] = (near + far) * rangeInv;
        resultM[11] = -1;
        resultM[12] = 0;
        resultM[13] = 0;
        resultM[14] = near * far * rangeInv * 2;
        resultM[15] = 0;

        return resultM;
    },

    //Function for a camera matrix with position, target and up direction
    lookAt: function (cameraPosition, target, up, resultM) {
        resultM = resultM || new Float32Array(16);
        var zAxis = matrix4Op.normalize(matrix4Op.subtractVectors(cameraPosition, target));
        var xAxis = matrix4Op.normalize(matrix4Op.cross(up, zAxis));
        var yAxis = matrix4Op.normalize(matrix4Op.cross(zAxis, xAxis));

        resultM[0] = xAxis[0];
        resultM[1] = xAxis[1];
        resultM[2] = xAxis[2];
        resultM[3] = 0;
        resultM[4] = yAxis[0];
        resultM[5] = yAxis[1];
        resultM[6] = yAxis[2];
        resultM[7] = 0;
        resultM[8] = zAxis[0];
        resultM[9] = zAxis[1];
        resultM[10] = zAxis[2];
        resultM[11] = 0;
        resultM[12] = cameraPosition[0];
        resultM[13] = cameraPosition[1];
        resultM[14] = cameraPosition[2];
        resultM[15] = 1;

        return resultM;
    },

    //Function for inversing a matrix
    inverse: function (m, resultM) {
        resultM = resultM || new Float32Array(16);
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        resultM[0] = d * t0;
        resultM[1] = d * t1;
        resultM[2] = d * t2;
        resultM[3] = d * t3;
        resultM[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
        resultM[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
        resultM[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
        resultM[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
        resultM[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
        resultM[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
        resultM[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
        resultM[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
        resultM[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
        resultM[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
        resultM[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
        resultM[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

        return resultM;
    },

    //Function for normalizing a vector
    normalize: function (v, resultM) {
        resultM = resultM || new Float32Array(3);
        var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we don't divide by 0.
        if (length > 0.00001) {
            resultM[0] = v[0] / length;
            resultM[1] = v[1] / length;
            resultM[2] = v[2] / length;
        }
        return resultM;
    },

    //Function for subtracting two vectors
    subtractVectors: function (a, b, resultM) {
        resultM = resultM || new Float32Array(3);
        resultM[0] = a[0] - b[0];
        resultM[1] = a[1] - b[1];
        resultM[2] = a[2] - b[2];
        return resultM;
    },

    //Function to get the cross product of two vectors
    cross: function (a, b, resultM) {
        resultM = resultM || new Float32Array(3);
        resultM[0] = a[1] * b[2] - a[2] * b[1];
        resultM[1] = a[2] * b[0] - a[0] * b[2];
        resultM[2] = a[0] * b[1] - a[1] * b[0];
        return resultM;
    },

    //Function to transpose a matrix
    transpose: function (m, resultM) {
        resultM = resultM || new Float32Array(16);

        resultM[0] = m[0];
        resultM[1] = m[4];
        resultM[2] = m[8];
        resultM[3] = m[12];
        resultM[4] = m[1];
        resultM[5] = m[5];
        resultM[6] = m[9];
        resultM[7] = m[13];
        resultM[8] = m[2];
        resultM[9] = m[6];
        resultM[10] = m[10];
        resultM[11] = m[14];
        resultM[12] = m[3];
        resultM[13] = m[7];
        resultM[14] = m[11];
        resultM[15] = m[15];

        return resultM;
    }

};

main();

// DrawRectangle.js
function main() {
    // Retrieve <canvas> element <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    
    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');
    
    // Draw a blue rectangle <- (3)
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.height);

    const v1 = new Vector3([2.25,2.25,0]);  
    drawVector(v1, "red");
} 

function drawVector (v,color){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    var x = v.elements[0];
    var y = v.elements[1];
    var originX = canvas.width/2;
    var originY = canvas.height/2;
    var scale = 20; 
    
    ctx.strokeStyle = color; 
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + x * scale, originY - y * scale);
    ctx.stroke();
}

function handleDrawEvent(){
    var canvas = document.getElementById('example');
    if(!canvas){
        console.log('Failed to retrieve canvas');
        return;
    }
    var ctx = canvas.getContext('2d');

    // clearing the canvas
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, canvas.width, canvas.height);

    var x = parseFloat(document.getElementById('x1').value);
    var y = parseFloat(document.getElementById('y1').value);
    var x2 = parseFloat(document.getElementById('x2').value);
    var y2 = parseFloat(document.getElementById('y2').value);
   
    if (isNaN(x)) x = 0;
    if (isNaN(y)) y = 0;
    if (isNaN(x2)) x2 = 0;
    if (isNaN(y2)) y2 = 0;

    var v1 = new Vector3([x, y, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    drawVector(v1, 'red');
    drawVector(v2, 'blue');
}

function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d'); 

    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, canvas.width, canvas.height);

    var x = parseFloat(document.getElementById('x1').value);
    var y = parseFloat(document.getElementById('y1').value);
    var x2 = parseFloat(document.getElementById('x2').value);
    var y2 = parseFloat(document.getElementById('y2').value);
    
    if (isNaN(x)) x = 0;
    if (isNaN(y)) y = 0;
    if (isNaN(x2)) x2 = 0;
    if (isNaN(y2)) y2 = 0;

    var v1 = new Vector3([x, y, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    drawVector(v1, 'red');
    drawVector(v2, 'blue');

    var o = document.getElementById('operation-select').value;
    var s = parseFloat(document.getElementById('scalar').value);
    if(isNaN(s)) s =1; 

    if (o == "add"){
        //v3 = v1 + v2
        var v3 = new Vector3(v1.elements); 
        v3.add(v2);
        drawVector(v3, "green");

    } else if (o == "sub"){
        // v3 = v1 - v2
        var v3 = new Vector3(v1.elements); 
        v3.sub(v2);
        drawVector(v3, "green");

    } else if (o == "mul"){
        //v3 = v1 * s
        var v3 = new Vector3(v1.elements);
        v3.mul(s);
        drawVector(v3, "green");

        //v4 = v2 * s
        var v4 = new Vector3(v2.elements);
        v4.mul(s);
        drawVector(v4, "green");

    } else if (o == "div"){
        var v3 = new Vector3(v1.elements);
        v3.div(s);
        drawVector(v3, "green");

        var v4 = new Vector3(v2.elements);
        v4.div(s);
        drawVector(v4, "green");

    } else if (o == "mag"){
        var mag1 = v1.magnitude();
        var mag2 = v2.magnitude();
        console.log("v1 magnitude:", mag1);
        console.log("v2 magnitude:", mag2);

    } else if (o == "norm"){
        var mag1 = v1.magnitude();
        var mag2 = v2.magnitude();
        console.log("v1 magnitude:", mag1);
        console.log("v2 magnitude:", mag2);

        var n1 = new Vector3(v1.elements);
        var n2 = new Vector3(v2.elements);
        n1.normalize();
        n2.normalize();
        drawVector(n1, "green");
        drawVector(n2, "green");

    } else if (o == "angle") {
        const angleDeg = angleBetween(v1, v2);
        if (angleDeg === null) {
            console.log("Zero Error");
        } else {
            console.log("Angle:", angleDeg);
        }
    } else if (o == "area") {
        const area = areaTriangle(v1, v2);
        console.log("Area of triangle:", area);
    }
}

function angleBetween(v1, v2) {
    //dot(v1, v2) = ||v1|| * ||v2|| * cos(alpha).
    const d = Vector3.dot(v1, v2);
    const m1 = v1.magnitude();
    const m2 = v2.magnitude();
    if (m1 === 0 || m2 === 0) {
        return null;
    }
    let cosAlpha = d / (m1 * m2);
    if (cosAlpha > 1)  cosAlpha = 1;
    if (cosAlpha < -1) cosAlpha = -1;

    const radians = Math.acos(cosAlpha);
    const degrees = radians * 180 / Math.PI;
    return degrees;
}

function areaTriangle(v1,v2){
    //||v1 x v2]]  equals to the area of the parallelogram that the vectors span.
    const cross = Vector3.cross(v1, v2);
    const area = cross.magnitude();
    const triangleArea = area /2.0;
    return triangleArea;
}
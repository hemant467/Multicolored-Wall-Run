function Camera(position)
{
  this.position = position;
  this.direction = [0.0, 0.0, 1.0];
  this.far = 500.0;
}

Camera.prototype.drawShape = function(context, shape)
{
  var projectedVertexs = [[]];
  var alpha = (3000 - shape.position[2]) / 3000;
  if ( shape.position[2] > 3000.0 ) alpha = 0.0;

  context.strokeStyle = shape.color;
  context.globalAlpha = alpha;
  for ( var i = 0, size = shape.vertexs.length ; i < size ; ++i )
  {
    projectedVertexs[i] = this.projection(shape.getVertex(i));
    projectedVertexs[i][1] = -projectedVertexs[i][1];
  }
  for ( var i = 0, size = shape.edges.length ; i < size ; ++i )
    drawEdge(context, projectedVertexs[shape.edges[i][0]], projectedVertexs[shape.edges[i][1]]);
}

Camera.prototype.projection = function(vertex)
{
  var projectedVertex = [];
  
  var translateVertex = substractVertexs(vertex, this.position);
  var scalarProjection = innerProductVertexs(translateVertex, this.direction);
  return scaleVertex(translateVertex, this.far / scalarProjection);
}

function Shape()
{
  this.edges = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [7, 6]];
  this.vertexs = [[1.0, 1.0, 1.0], [1.0, 0.0, 1.0], [-1.0, 1.0, 1.0], [-1.0, 0.0, 1.0], [1.0, 1.0, -1.0], [1.0, 0.0, -1.0], [-1.0, 1.0, -1.0], [-1.0, 0.0, -1.0]];
  this.position = [0.0, 0.0, 1000.0];
  this.width = 1.0;
  this.height = 1.0;
  this.color = "green";
}

Shape.prototype.setShape = function(width, height)
{
  this.width = width;
  this.height = height;
}

Shape.prototype.getVertex = function(index)
{
  var vertex = []
  vertex[0] = this.vertexs[index][0] * this.width;
  vertex[1] = this.vertexs[index][1] * this.height;
  vertex[2] = this.vertexs[index][2] * this.width;
  return addVertexs(vertex, this.position);
}

Shape.prototype.reset = function(minHeight)
{
  this.position[0] = Math.floor((Math.random() * 1000) - 500);
  this.position[2] += 3000.0;
  this.setShape(Math.floor((Math.random() * settings.deltaWidth) + settings.minWidth), Math.floor((Math.random() * settings.deltaHeight) + minHeight));
  this.color = getColor();
}

Shape.prototype.nearest = function() { return this.getVertex(4)[2]; }

Shape.prototype.collideWithPoint = function(x, y)
{
  var maxX = this.getVertex(0)[0];
  var maxY = this.getVertex(0)[1];
  var minX = this.getVertex(3)[0];
  var minY = this.getVertex(3)[1];
  if ( x < minX ) return false;
  if ( x > maxX ) return false;
  if ( y < minY ) return false;
  if ( y > maxY ) return false;
  return true;
}

function addVertexs(vertex1, vertex2) { return [vertex1[0] + vertex2[0], vertex1[1] + vertex2[1], vertex1[2] + vertex2[2]]; }

function drawEdge(context, vertex1, vertex2)
{
  var offsetX = context.canvas.width  / 2.0; 
  var offsetY = context.canvas.height / 2.0;

  context.beginPath();
  context.moveTo(vertex1[0] + offsetX, vertex1[1] + offsetY);
  context.lineTo(vertex2[0] + offsetX, vertex2[1] + offsetY);
  context.stroke();
}

function innerProductVertexs(vertex1, vertex2) { return vertex1[0] * vertex2[0] + vertex1[1] * vertex2[1] + vertex1[2] * vertex2[2]; }

function scaleVertex(vertex, scalar) { return [scalar * vertex[0], scalar * vertex[1], scalar * vertex[2]]; }

function substractVertexs(vertex1, vertex2) { return [vertex1[0] - vertex2[0], vertex1[1] - vertex2[1], vertex1[2] - vertex2[2]]; }

function getColor()
{
  var color;
  if ( settings.gameMode ) color = (counter / 1000) % 360;
  else color =  Math.floor((Math.random() * 360));
  return "hsl("+ color +", 100%, 50%)";
}

function Settings()
{
  this.velocity = 3.0;
  this.minWidth = 20.0;
  this.deltaWidth = 50.0;
  this.minHeight = 150.0;
  this.deltaHeight = 50.0;
  this.far = 1000.0;
  this.gameMode = false;
}

var camera = new Camera([0.0, 100.0, 0.0]);

var settings = new Settings();
var gui = new dat.GUI();

gui.add(settings, 'velocity').min(0.00).max(100.0).step(0.02).listen();
gui.add(settings, 'minWidth').min(10.00).max(300.0).step(0.02);
gui.add(settings, 'deltaWidth').min(0.00).max(300.0).step(0.02);
gui.add(settings, 'minHeight').min(0.00).max(300.0).step(0.02);
gui.add(settings, 'deltaHeight').min(1.00).max(1000.0).step(0.02);
gui.add(settings, 'far').min(1.00).max(1000.0).step(0.02).onChange(function(value){ camera.far = settings.far;});
gui.add(settings, 'gameMode').onChange(function(value){ counter = 0;});

var canvas = document.getElementById('canvas');
var shapes = [];
var numShapes = 20;
var step = 3000.0 / 20;
for ( var i = 0 ; i < numShapes ; i++ )
{
  var shape = new Shape();
  shape.position[0] = Math.floor((Math.random() * 1000) - 500);
  shape.position[2] = Math.floor(3000.0 - (step * i));
  shape.setShape(Math.floor((Math.random() * settings.deltaWidth) + settings.minWidth), Math.floor((Math.random() * settings.deltaHeight) + settings.minHeight));
  shape.color = getColor();
  shapes[i] = shape;
}

canvas.addEventListener("mousemove", function(event) { camera.position[0] = (event.pageX - canvas.offsetLeft) - (canvas.width / 2); camera.position[1] = canvas.height - (event.pageY - canvas.offsetTop); }, false);
canvas.addEventListener("mousedown", function(event) { settings.velocity += 3.0; }, false);

var counter = 0;

setInterval( function()
{
  var context = canvas.getContext("2d");
  context.fillStyle = "black";
  context.globalAlpha = 1.0;
  context.fillRect(0, 0, canvas.width, canvas.height);
  var gameOver = false; 
  counter += settings.velocity;
  var minHeight = settings.minHeight;
  if ( settings.gameMode ) minHeight = 700;
  for ( var i = 0 ; i < shapes.length ; i++ )
  {
    var shape = shapes[i];
    shape.position[2] -= settings.velocity;
    if ( shape.nearest() < camera.position[2] )
    {
      if (settings.gameMode && shape.collideWithPoint(camera.position[0], camera.position[1] ) ) gameOver = true;
      shape.reset(minHeight);
    }
    camera.drawShape(context, shape);
  }
  if ( gameOver )
  {
    settings.velocity = 0.0;
    alert("Game Over -- You survived for " + Math.round(counter / 10) + " mts.!!.\nClick on the screen to restart.");
    counter = 0;
  }
}, 15);
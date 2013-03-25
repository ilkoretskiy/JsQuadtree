
function Rect(x1, y1, x2, y2){
	this.x1 = x1
	this.y1 = y1
	this.x2 = x2
	this.y2 = y2
}

function Point(x, y){
	this.x = x
	this.y = y
}

var Node = function(capacity, rect, parent){	
	var capacity = capacity,
		rect = rect,
		parent = parent,
		coord = new Point( (rect.x1 + rect.x2) / 2, (rect.y1 + rect.y2) / 2),
		children = [],
		points = []
	
	children_count = 4
	ChildDirectionEnum = {LeftTop:0, RightTop:1, LeftBottom:2, RightBottom:3};
	
	Object.freeze(ChildDirectionEnum);
		
	var need_to_split = function(){
		//console.log("need_to_split", points.length > capacity)
		return points.length > capacity
	}
	
	var can_split = function(){
		return (Math.abs(rect.x2 - rect.x1) > 1 && Math.abs(rect.y2 - rect.y1) > 1)
	}
	
	var split_rect_by_index = function(rect, idx){
		var output_rect = null
		if (idx == ChildDirectionEnum.LeftTop){
			output_rect = new Rect(rect.x1, rect.y1, 
					(rect.x1 + rect.x2) / 2, (rect.y1 + rect.y2) / 2)
		} else if(idx == ChildDirectionEnum.RightTop) {
			output_rect = new Rect((rect.x1 + rect.x2) / 2, rect.y1, 
					rect.x2, (rect.y1 + rect.y2) / 2)
		} else if(idx == ChildDirectionEnum.LeftBottom) {			
			output_rect = new Rect(rect.x1, (rect.y1 + rect.y2) / 2, 
					(rect.x1 + rect.x2) / 2, rect.y2)
		} else if(idx == ChildDirectionEnum.RightBottom) {
			output_rect = new Rect((rect.x1 + rect.x2) / 2, (rect.y1 + rect.y2) / 2, 
					rect.x2, rect.y2)		
		}
		//console.log("outputrect", output_rect)
		return output_rect
	}
	
	var split_node = function(){		
		//console.log("split node")
		for (var i = 0; i < children_count; ++i){
			var newNode = new Node(capacity, split_rect_by_index(rect, i), this)
			children.push(newNode)
		}		
		for (var i = 0; i < points.length; ++i){
			var child = _get_node_for_point(points[i])
			child.add_point(points[i])
			//console.log("reasset", child.get_points().length)
		}
		//console.log('///////////////////////////////////////////////')
		for (var i = 0; i < children.length; ++i){
			//console.log("children", i,  children[i].get_points().length, children[i].get_coord());
		}
		//console.log('///////////////////////////////////////////////')
		points = []
		//console.log( "count after erase " , children[0].get_points().length)
	}
	
	var has_children = function(){
		//console.log("has_children", children.length != 0)
		return (children.length != 0)
	}
	
	var _get_node_for_point = function(point){
			console.log("get_node_for_point", point)
			
			var child = null			
			if (point.x < coord.x){
				if (point.y < coord.y){
					//console.log("LeftTop")
					child = children[ChildDirectionEnum.LeftTop]
				} else {
					//console.log("LeftBottom")
					child = children[ChildDirectionEnum.LeftBottom]
				}
			} else {
				if (point.y < coord.y){
					//console.log("RightTop")
					child = children[ChildDirectionEnum.RightTop]
				} else {
					//console.log("RightBottom")
					child = children[ChildDirectionEnum.RightBottom]
				}
			}
						
			return child
		}
	
	return{
		is_empty: function(){			
			//console.log("is_empty", points.length != 0 && !has_children())
			return (points.length == 0 && !has_children())
		},
		ready_for_points: function(){			
			//console.log("ready_for_points", (points.length <= capacity && !has_children()) )			
			return (points.length <= capacity && !has_children());
		},
		get_coord: function(){
			//console.log("get_coord")
			return coord
		},
		get_rect: function(){
			//console.log("get_rect")
			return rect
		},
		get_children: function(){
			//console.log("get_children")
			return children
		},
		get_points: function(){
			//console.log("get_points")
			return points
		},
		get_node_for_point: _get_node_for_point,	
		add_point: function(point){
			//console.log("add_point", point)
			points.push(point)
			if (need_to_split() && can_split()){
				split_node()
			}
		}
	}
}

var QuadTree = function(rect_, node_capacity_){
	var node_capacity = node_capacity_
	var rect = rect_
	var root = new Node(node_capacity, rect)
	//this.root = Node(self.__node_capacity, rect)
	
	var	recursive_drawing = function(ctx, node){		
		var coord = node.get_coord()
		var rect = node.get_rect()		
		ctx.strokeRect(rect.x1 + 1, rect.y1 + 1, rect.x2 - rect.x1 - 1 , rect.y2 - rect.y1 - 1);
		
		if (node.is_empty()){
			return true
		}
		
		var points = node.get_points()			
		//console.log("count of point for drawing", points.length)
		for (var i = 0; i < points.length; i++){	
			var point = points[i]
			var rad = 2
			ctx.beginPath()			
			ctx.arc(point.x, point.y, rad, 0, 2 * Math.PI)
			ctx.fill()
		}
		
		var children = node.get_children()
		
		for (var i = 0; i < children.length; i++){
			//console.log('children i', i, children[i].get_points().length)			
			recursive_drawing(ctx, children[i])
		}
	}
	
	return{
		insert: function (point){
			var node = root
			var isInserted = false
			
			while( !isInserted ){			
				if (node.ready_for_points()){
					node.add_point(point)
					isInserted = true
				} else {
					node = node.get_node_for_point(point)
				}					
			}
		},
		
		draw: function (ctx){		
			var node = root			
			recursive_drawing(ctx, node)
		}
	};
};

var quadTree = {}
var treeImageLayer = {}
function onLoad()
{
	canvas = document.getElementById("drawArea");
	if (!canvas.getContext)
	{
		console.log("can't init canvas");
		return;
	}
	
	canvas.addEventListener("click", clickProcessing, false)
	canvas.addEventListener("mousemove", moveProcessing, false)
	
	ctx = canvas.getContext('2d');	
	width = ctx.canvas.width;
	height = ctx.canvas.height;

	ctx.strokeRect(0, 0, width, height);
	quadTree = new QuadTree(new Rect(0, 0, width, height), 1)
}

function getCursorPosition(e){
	if (typeof(e) == 'undefined')
	{
		console.log("error pos" , e)
		return 
	}
	var x;
	var y;
	if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    }
    else {
      x = e.clientX + document.body.scrollLeft +
           document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop +
           document.documentElement.scrollTop;
    }
    
    x -= canvas.offsetLeft;
	y -= canvas.offsetTop;

    return (new Point(x, y))
}

function moveProcessing(e)
{
	var pos = getCursorPosition(e)
	var rad = 2
	pos.x = pos.x - pos.x % 4
	pos.y = pos.y - pos.y % 4	
	ctx.clearRect(0, 0, width, height)
	quadTree.draw(ctx)	
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, rad, 0, 2 * Math.PI)
	ctx.fill();		
}
	
function clickProcessing(e)
{
	var pos = getCursorPosition(e)
	pos.x = pos.x - pos.x % 4
	pos.y = pos.y - pos.y % 4	
	quadTree.insert(pos)
	quadTree.draw(ctx)	
}

Raphael.fn.arrow = function (begin_x,begin_y,end_x,end_y) {
  var points = Raphael.fn.my_stuff.arrow_help(begin_x, begin_y, end_x, end_y)
  var side_1_x = points[0]
  var side_1_y = points[1]
  var side_2_x = points[2]
  var side_2_y = points[3]
  var st = this.set();
  var body = this.path("M" + begin_x + " "+ begin_y + "L" + end_x + " " + end_y)
  var side_1 = this.path("M" + side_1_x + " "+ side_1_y + "L" + end_x + " " + end_y)
  var side_2 = this.path("M" + side_2_x + " "+ side_2_y + "L" + end_x + " " + end_y)
  return st.push(body,side_1,side_2);
}
Raphael.fn.my_stuff = {
  // 根据两个点的坐标，返回 前头的 那两个坐标
  arrow_help: function(begin_x,begin_y,end_x,end_y){
    var jiaodu = 60/2
    var length = Math.sqrt(Math.pow(Math.abs(begin_x-end_x),2) + Math.pow(Math.abs(begin_y-end_y),2))
    var a = end_y - begin_y
    var b = end_x - begin_x
    var d = length*(Math.tan(Math.PI/180*jiaodu))
    var ox = a/length*d
    var oy = b/length*d
    var a_x = begin_x-ox
    var a_y = begin_y+oy
    var b_x = begin_x+ox
    var b_y = begin_y-oy
    // side_1 side_2 两个点
    var side_1_x = Math.round(end_x-(end_x-a_x)/5)
    var side_1_y = Math.round(end_y-(end_y-a_y)/5)
    var side_2_x = Math.round(end_x-(end_x-b_x)/5)
    var side_2_y = Math.round(end_y-(end_y-b_y)/5)
    return [side_1_x,side_1_y,side_2_x,side_2_y]
  },
  // 求 4 个坐标的 left 和 top
  left_and_top: function(a,b,c,d){
    left = Math.min(a[0],b[0],c[0],d[0])
    top = Math.min(a[1],b[1],c[1],d[1])
    return [left,top]
  },
  // 最右下的点
  down_x_and_y: function(a,b,c,d){
    left = Math.max(a[0],b[0],c[0],d[0])
    top = Math.max(a[1],b[1],c[1],d[1])
    return [left,top]
  },
  width_and_height:function(a,b,c,d){
    var min_point = Raphael.fn.my_stuff.left_and_top(a,b,c,d)
    var max_point = Raphael.fn.my_stuff.down_x_and_y(a,b,c,d)
    var width = max_point[0] - min_point[0]
    var height = max_point[1] - min_point[1]
    return [width,height]
  }
}

window.Draw = {
  paper_attr:{
    fill:'none',
    stroke:'#e8641b',
    'stroke-width':'3px'
  },
  palette_register_click_fun: [],
  clear_palette_register_click: function(){
    Draw.palette_register_click_fun.each(function(fun){
      Draw.palette.stopObserving('click',fun)
    })
  },
  _reg_a_create_event: function(create_fun){
    Draw.clear_palette_register_click()
    Draw.palette_register_click_fun = []
    var create = create_fun.bind(Draw);
    var stop_fun = (function(){
      Draw.palette.stopObserving('click',create)
    }).bind(Draw)
    Draw.palette.observe('click',create)
    Draw.palette.observe('click',stop_fun)
    Draw.palette_register_click_fun.push(create)
    Draw.palette_register_click_fun.push(stop_fun)
  },
  // ---------------------------------------------------
  // ------------供外部使用的事件---------------------------------------
  reg_create_a_cycle: function(){
    Draw._reg_a_create_event(Draw.create_cycle)
  },
  reg_create_a_arrow: function(){
    Draw._reg_a_create_event(Draw.create_arrow)
  },
  reg_create_a_rect: function(){
    Draw._reg_a_create_event(Draw.create_rect)
  },
  // --------------------------------------------------
  // --------------------画图形的函数---------------------------------------
  create_cycle: function(evt){
    var x = Draw.get_x_of_palette(evt.pointerX())
    var y = Draw.get_y_of_palette(evt.pointerY())
    Draw._raphael_circle(x,y,50)
  },
  create_arrow: function(evt){
    var x = Draw.get_x_of_palette(evt.pointerX())
    var y = Draw.get_y_of_palette(evt.pointerY())
    var arrow_length = 100
    Draw._raphael_arrow(x-arrow_length/2,y,x+arrow_length/2,y)
  },
  create_rect: function(evt){
    var x = Draw.get_x_of_palette(evt.pointerX())
    var y = Draw.get_y_of_palette(evt.pointerY())
    Draw._raphael_rect(x,y,100,50)
  },
  // ------------------------------------------------
  // ------------------给图形套 DIV 相关函数------------------------
  _raphael_circle: function(x,y,radius){
    div_width = div_height = radius*2 + parseInt(Draw.paper_attr['stroke-width'])*2
    div_left = x-div_width/2
    div_top = y-div_height/2
    var raphael_div = Draw._create_raphael_div(div_left,div_top,div_width,div_height)
    paper = Raphael(raphael_div,div_width,div_height)
    var circle = paper.circle(div_width/2,div_height/2,radius)
    circle.attr(Draw.paper_attr)
  },
  _raphael_rect: function(x,y,width,height){
    div_width = width + parseInt(Draw.paper_attr['stroke-width'])*2
    div_height = height + parseInt(Draw.paper_attr['stroke-width'])*2
    div_left = x-div_width/2
    div_top = y-div_height/2
    rect_left = div_width/2 - width/2
    rect_top = div_height/2 - height/2
    var raphael_div = Draw._create_raphael_div(div_left,div_top,div_width,div_height)
    paper = Raphael(raphael_div,div_width,div_height)
    var rect = paper.rect(rect_left,rect_top,width,height)
    rect.attr(Draw.paper_attr)
  },
  _raphael_arrow: function(begin_x,begin_y,end_x,end_y){
    var lt = Draw.get_arrow_left_and_top(begin_x,begin_y,end_x,end_y)
    var left = lt[0]
    var top = lt[1]
    var wh = Draw.get_arrow_width_and_height(begin_x,begin_y,end_x,end_y)
    var width = wh[0]
    var height = wh[1]
    var raphael_div = Draw._create_raphael_div(left,top,width,height)
    paper = Raphael(raphael_div,width,height)
    var arrow = paper.arrow(begin_x-left,begin_y-top,end_x-left,end_y-top)
    arrow.attr(Draw.paper_attr)
  },
  // ----------------------------------------------------------------
  // -------------------- raphael_div --------------------------------------------
  _create_raphael_div: function(left,top,width,height){
    var raphael_div = Builder.node('div',{
      style:'position:absolute;'
    })
    $(raphael_div).setStyle({
//            backgroundColor:'blue',
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px"
    })
    new Insertion.Bottom(Draw.palette, raphael_div)
    return raphael_div
  },
  get_x_of_palette: function(x){
    return x - Draw.palette.viewportOffset()[0]
  },
  get_y_of_palette: function(y){
    return y - Draw.palette.viewportOffset()[1]
  },
  get_arrow_left_and_top: function(begin_x,begin_y,end_x,end_y){
    var points = Raphael.fn.my_stuff.arrow_help(begin_x, begin_y, end_x, end_y)
    var side_1_x = points[0]
    var side_1_y = points[1]
    var side_2_x = points[2]
    var side_2_y = points[3]
    return Raphael.fn.my_stuff.left_and_top([begin_x,begin_y],[end_x,end_y],[side_1_x,side_1_y],[side_2_x,side_2_y])
  },
  get_arrow_width_and_height:function(begin_x,begin_y,end_x,end_y){
    var points = Raphael.fn.my_stuff.arrow_help(begin_x, begin_y, end_x, end_y)
    var side_1_x = points[0]
    var side_1_y = points[1]
    var side_2_x = points[2]
    var side_2_y = points[3]
    return Raphael.fn.my_stuff.width_and_height([begin_x,begin_y],[end_x,end_y],[side_1_x,side_1_y],[side_2_x,side_2_y])
  }
}
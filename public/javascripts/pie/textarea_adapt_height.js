(function(){
  pie.TextareaAdaptHeight = function(a){
    var line_height = 18
    // 获得行数
    var lines_count = 1

    var match = a.readAttribute("rel").match(/adapt\[:(.*)\]/)
    if(match){
      lines_count = match[1]
    }

    // 根据行数获得高度
    var height = lines_count * line_height
    a.defaultHeight = height

    // 初始化 textarea 样式
    a.setStyle({
      overflow: "hidden",
      fontFamily: "Tahoma,宋体",
      borderStyle: "solid",
      borderWidth: "1px",
      wordWrap: "break-word",
      fontSize: "12px",
      lineHeight: line_height + "px",
      height: height + "px"
    })

    // 增加一个 value_change 事件
    a.observe("dom:value_change",function(){

      if(!a.virtual_textarea){
        a.virtual_textarea = get_virtual_textarea()
      }

      if(a.virtual_textarea.target!=a){
        set_virtual_textarea_by(a)
        a.virtual_textarea.target=a
      }
      a.virtual_textarea.value=a.value;
      snapHeight=Math.max(a.virtual_textarea.scrollHeight,a.defaultHeight);
      a.setStyle({
        height: snapHeight + "px"
      })
    })

    // 获取焦点 注册 时间监听器
    $(a).observe("focus",function(){
      if(pie.TextareaAdaptHeight.Executer){
        pie.TextareaAdaptHeight.Executer.stop();
      }
      pie.TextareaAdaptHeight.Executer = new PeriodicalExecuter(function(){
        a.fire("dom:value_change")
      },0.01);
    });

    // 失去焦点，销毁监听器
    $(a).observe("blur",function(){
      if(pie.TextareaAdaptHeight.Executer){
        pie.TextareaAdaptHeight.Executer.stop();
      }
    });
    // 清除 firefox 的 历史记录
    a.value = ""
  }

  function get_virtual_textarea(){
    var textarea = $("virtual_textarea")
    if(!textarea){
      textarea = Builder.node("textarea",{
        id:"virtual_textarea",
        style:"position:absolute;left:-1000px;top:-1000px;"
      })
      new Insertion.Bottom($(document.body),textarea)
    }
    return textarea
  }

  function set_virtual_textarea_by(a){
    var textarea = a.virtual_textarea
    textarea.setStyle({
      height:"0px",
      overflow:"hidden"
    })

    textarea.setStyle({
      fontFamily:a.getStyle("fontFamily")
    })
    textarea.setStyle({
      borderStyle:a.getStyle("borderStyle")
    })
    textarea.setStyle({
      borderWidth:a.getStyle("borderWidth")
    })
    textarea.setStyle({
      wordWrap:a.getStyle("wordWrap")
    })
    textarea.setStyle({
      fontSize:a.getStyle("fontSize")
    })
    textarea.setStyle({
      lineHeight:a.getStyle("lineHeight")
    })
  }
})();
pie.TextareaAdaptHeight.init = function(){
  $$('textarea[rel*=adapt]').each(function(a){
    if(a.hasClassName("adapt-packed")) return
    a.addClassName("adapt-packed")
    pie.TextareaAdaptHeight(a)
  })
};
pie.load(function() {
  pie.TextareaAdaptHeight.init()
});
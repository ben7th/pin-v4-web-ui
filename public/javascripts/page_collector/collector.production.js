function mindpin_js_require(src,handler){
  var lib = document.createElement('script');
  lib.type = 'text/javascript';
  lib.src = src;
  lib.id = 'mindpin_js_lib_'+Math.random();
  lib.onload = handler;
  lib.onreadystatechange = function(){
    if(this.readyState == 'complete') handler();
  }
  document.body.appendChild(lib);
}

(function(){
  try{
    var site_url = 'http://ei.mindpin.com' //调试的时候改成自己工程的
    mindpin_js_require(site_url+'/javascripts/prototype.js',function(){
      mindpin_js_require(site_url+'/javascripts/builder.js',function(){
        var div_el = Builder.node('div',{
          'style':'position:fixed;height:100%;width:300px;right:0px;top:0px;background-color:#FFFACD;z-index:2147483647;border-left:solid 1px;border-right:solid 1px;'
        });

        var clip = $(Builder.node('a',{
          'href':'javascript:void(0)',
          'style':'margin-right:12px;color:white;text-decoration:none;'
        },'CLIP')).observe('click',function(){new CollectorClip().start_clip();})

        var close_me = $(Builder.node('div',{},[
          clip,
          Builder.node('a',{
            'href':'javascript:void(0)',
            'style':'margin-right:12px;color:white;text-decoration:none;'
          },'X').observe('click',function(){
            $(div_el).remove();
          }
        )])).setStyle({
          'position':'absolute',
          'top':'0px',
          'fontSize':'16px',
          'fontWeight':'bold',
          'lineHeight':'24px',
          'color':'white',
          'backgroundColor':'black',
          'width':'100%',
          'textAlign':'right',
          'fontFamily':'arial'
        });

        div_el.insert(Builder.node('div',{'style':'height:100%;'},[
          close_me,
          Builder.node('iframe',{
            'frameborder':0,
            'style':'height:100%;',
            'src':site_url+'/collector?web_site_url='+encodeURI(location.href)+'&title='+encodeURI(document.title)
          })
        ]));
        document.body.appendChild(div_el);

        CollectorClip = Class.create({
          initialize: function(options){
            this.coverlayer_top = this._make_coverlayer_dom();
            this.coverlayer_bottom = this._make_coverlayer_dom();
            this.coverlayer_left = this._make_coverlayer_dom();
            this.coverlayer_right = this._make_coverlayer_dom();
          },

          _make_coverlayer_dom:function(){
            return $(Builder.node('div',{'class':'mindpin_clip_coverlayer'})).setStyle({
              'backgroundColor':'#EF9C00',
              'position':'absolute',
              'opacity': 1
            }).hide();
          },

          start_clip: function(){
            if(document.body.hasClassName('MINDPIN_COLLECTOR_CLIP')){
              //nothing//
            }else{
              document.body.addClassName('MINDPIN_COLLECTOR_CLIP');

              Event.observe(document.body,'mouseover',this._select_clip.bindAsEventListener(this));
              Event.observe(document.body,'click',this._do_clip.bindAsEventListener(this));

            }
          },
          can_be_clip:function(el){
            var c1 = (!el.hasClassName('mindpin_clip_coverlayer'));
            var c2 = (el != document.body);
            var c3 = (el.parentNode != document.body || el.tagName!='DIV')
            var c4 = (el.descendants().length < 5)
            return c1 && c2 && c3 && c4;
          },

          _select_clip:function(evt){
            var el = $(evt.element());
            if(this.can_be_clip(el)){
              evt.stop();
              this.put_clip_doms(el);
            }else{
              $$('.mindpin_clip_coverlayer').each(function(m){
                console.log(m)
                m.remove();
              })
            }
          },

          put_clip_doms:function(el){
            var d = el.getDimensions();
            var o = el.cumulativeOffset();

            var b = 5;

            this.coverlayer_top.setStyle({
              'width': d.width + 'px','height': b + 'px',
              'top': o.top + 'px','left': o.left + 'px'
            }).show();
            this.coverlayer_bottom.setStyle({
              'width': d.width + 'px','height': b + 'px',
              'top': o.top + d.height - b + 'px','left': o.left + 'px'
            }).show();
            this.coverlayer_left.setStyle({
              'width': b + 'px','height': d.height + 'px',
              'top': o.top + 'px','left': o.left + 'px'
            }).show();
            this.coverlayer_right.setStyle({
              'width': b + 'px','height': d.height + 'px',
              'top': o.top + 'px','left': o.left + d.width - b + 'px'
            }).show();

            document.body.appendChild(this.coverlayer_top);
            document.body.appendChild(this.coverlayer_bottom);
            document.body.appendChild(this.coverlayer_left);
            document.body.appendChild(this.coverlayer_right);
          },

          _do_clip:function(evt){
            var el = $(evt.element().cloneNode(true)).cleanWhitespace();
            var a = Builder.node('div',{},el);
            alert(a.innerHTML.strip())
          }
        })

      })
    })
  }catch(e){alert(e)}
})();
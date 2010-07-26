module UiMplistHelper
  include MindpinUiConvention
  
  def mplist(collection=[],options={},&block)
    # 列表的classname
    for_class = [options[:class],get_mplist_classname(options[:for])]*' '
    select_class = options[:select] ? 'selectable':''
    hide_empty_text_class = options[:hide_empty_text] ? 'hide_empty_text':''
    empty = collection.blank?
    classname = [for_class,select_class,hide_empty_text_class,(empty ? 'empty':''),'mplist']*' '
    filter = options[:filter]
    display_mode =options[:display_mode]
    # 列表的标题
    title = options[:title]
    collection_id = build_ul_id(options[:for])
    # 列表的ID
    html_id = "mplist_#{options[:id] || collection_id || rand}"
    
    concat("<ul id='#{html_id}' class='#{classname}' filter='#{filter}' display_mode='#{display_mode}' >")
    concat("<h4>#{title}</h4>") if title
    if empty
      concat(mplist_empty)
    else
      if block_given?
        _mplist_block_given(collection,&block)
      else
        _mplist_block_not_given(collection,options)
      end
    end
    concat("</ul>")
  end

  def _mplist_block_given(collection,&block)
    collection.each do |member|
      case member
      when ActiveRecord::Base
        concat(content_tag_for(:li, member, :class=>'mli') do
          capture(member, &block)
        end)
      else
        concat("<li id='#{build_object_html_id member}' class='mli'>")
        concat capture(member, &block)
        concat("</li>")
      end
    end
  end

  def _mplist_block_not_given(collection,options)
    options[:locals] ||= {}
    collection.each do |member|
      if member.nil?
        concat '<li>nil error</li>'
        next
      end
      partial = options[:partial] || "#{member.class.name.underscore.pluralize}/info_#{get_partial_base_name_of_model(member)}"
      locals = {get_sym_of(member)=>member}.merge(options[:locals])
      concat(content_tag_for(:li, member, :class=>'mli') do
        render :partial=>partial,:locals=>locals
      end)
    end
  end

  def build_object_html_id(obj)
    "#{obj.class.name}_o#{obj.object_id}"
  end

  def mplist_empty
    "<span class='empty'>没有内容</span>"
  end

  # 清空标准列表内所有dom
  def clear_mplist(list_id)
    partten = "##{list_id}.mplist"
    page<< %`
      $$(#{partten.to_json}).each(function(list){
        list.select('li').each(function(li){$(li).remove()})
        list.insert(#{mplist_empty.to_json});
      })
    `
  end

  def swap_mplist_li(model_self,model_other)
    if !model_other.blank?
      html_id_a = page.context.dom_id model_self
      html_id_b = page.context.dom_id model_other
      partten_a = '.mplist #'+html_id_a
      partten_b = '.mplist #'+html_id_b
      page << %~
        dom_a = $$("#{partten_a}").first()
        dom_b = $$("#{partten_b}").first()
        dom_a_before = new Element('li',{ 'class':'hide'}).update("temp");
        dom_b_before = new Element('li',{ 'class':'hide'}).update("temp");
          new Insertion.Before(dom_a,dom_a_before)
          new Insertion.Before(dom_b,dom_b_before)
          new Insertion.After(dom_a_before, dom_b)
          new Insertion.After(dom_b_before, dom_a)
          dom_a_before.remove()
          dom_b_before.remove()
      ~
    end
  end

  def li_cancel_link
    "<span onclick='try{pie.mplist.close_edit_form()}catch(e){}'>#{t('page.form.cancel')}</span>"
#    link_to_function t('page.form.cancel'),'try{pie.mplist.close_edit_form()}catch(e){}'
  end

  # ----------------------------------

  def select_mplist_li(model)
    html_id = page.context.dom_id model
    partten = '.mplist #'+html_id
    page<< %~
      var li = $$('#{partten}')[0];
      do_mp_select_mplist_li_change_class_name(li)
    ~
  end

  def li_continue
    %`
      <div class="base">
        <div class="quick-continue">
          <div class="icon"></div>
          <div class="border"></div>
        </div>
      </div>
    `
  end

  def click_to_page_link(model,position,options)
    # 这里有重复绑定事件的bug 通过先尝试解除绑定来修复
    %~
      <script type='text/javascript'>
        try{
          $("#{dom_id(model)}").stopObserving('click',pie.click_#{dom_id(model)}_handler)
        }catch(e){}
        pie.click_#{dom_id(model)}_handler = function(evt){
          evt.stop();
          var el = evt.element()
          if(el.hasClassName('menu-icon')) return false;
          #{page_link_function(position,options)}
          var li = pie.mplist._get_mpli(el);
          if(li) pie.mplist._do_select_mplist_li(li);
        }
        $("#{dom_id(model)}").observe('click',pie.click_#{dom_id(model)}_handler)
      </script>
    ~
  end

  def context
    page.instance_variable_get("@context").instance_variable_get("@template")
  end
end

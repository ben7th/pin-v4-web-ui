class MindpinUiRender
  def initialize(context,page,&block)
    @page = page # rjs 的调用句柄
    @context = context # controller上下文实例
    @controller = @context.instance_exec{@controller} # controller实例
  end

  attr_reader :page
  attr_reader :context
  attr_reader :controller

  def render(*args)
    context.render(*args)
  end

  private
    # 根据传入参数获得包含action和controller的hash
    # {:action=>"create", :controller=>"text_entries"}
    def recognize_path(url,options)
      ActionController::Routing::Routes.recognize_path(url,options)
    end

  module MindpinUiRender::FboxModule
    def fbox(operation,extra={},&block)
      if [:show,:close,:javascript].include?(operation)
        page << eval("_build_#{operation}_fbox_js(extra,&block)")
      end
    end

    def _build_show_fbox_js(extra)
      title = extra[:title]
      title = title.blank? ? "":"<h3 class='f_box'>#{title}</h3>"
      case extra
      when String
        %`
          show_fbox(#{extra.to_json})
        `
      else
        if extra[:partial]
          partial = extra[:partial]
          locals = extra[:locals] || {}
          partial_str = render :partial=>partial,:locals=>{}.merge(locals)
          %`
            show_fbox(#{(title+partial_str).to_json})
          `
        elsif extra[:content]
          str = extra[:content]
          %`
            show_fbox(#{(title+str).to_json})
          `
        end
      end
    end

    def _build_close_fbox_js(extra)
      'close_fbox();'
    end
  end

  module MindpinUiRender::MplistModule

    # mplist综合渲染器
    # 使用方法：
    #   ui.mplist(:操作, 选择器, 其他参数)
    #   
    # 根据 模型 和默认规则指定 ul li model
    #   ui.mplist(:操作, <ActiveRecord::Base>)
    #   ui.mplist(:操作, <ActiveRecord::Base>, {:partial=>xxx,:locals=>{:xxx=>xxx}})
    #
    # 根据 包括模型的数组 和默认规则指定 ul li model， 而且给模板传入额外参数
    #   ui.mplist(:操作, [:prefix,<ActiveRecord::Base>])
    #   ui.mplist(:操作, [:prefix,<ActiveRecord::Base>], {:partial=>xxx,:locals=>{:xxx=>xxx}})
    #
    # 自己指定 ul li model
    #   ui.mplist(:操作, {:ul=>xxx, :li=>xxx, :model=>xxx}
    #   ui.mplist(:操作, {:ul=>xxx, :li=>xxx, :model=>xxx}, {:partial=>xxx,:locals=>{:xxx=>xxx}})
    #
    # 如果不指定 partial 将根据 model 指定 partial
    def mplist(operation, selector, extra={}, &block)
      if [:insert,:update,:new,:edit,:remove,:javascript].include?(operation)
        page << eval("_build_#{operation}_mplist_js(selector,extra,&block)")
      end
    end

    def _build_insert_mplist_js(selector,extra)
      model = _get_model(selector)
      ul_pattern = _get_ul_pattern(selector)

      prev_li_pattern = _get_li_pattern(extra[:prev])
      str = context.content_tag_for :li,model,:class=>'mli' do
        _get_partial_str(:info,model,extra)
      end

      %`
        $$(#{ul_pattern.to_json}).each(function(ul){
          pie.mplist.insert_li(ul,#{str.to_json},#{prev_li_pattern.to_json});
        });
      `
    end

    def _build_remove_mplist_js(selector,extra)
      li_pattern = _get_li_pattern(selector)
      %`
        $$(#{li_pattern.to_json}).each(function(li){
          pie.mplist.remove_li(li);
        });
      `
    end

    def _build_update_mplist_js(selector,extra)
      model = _get_model(selector)
      li_pattern = _get_li_pattern(selector)
      str = _get_partial_str(:info,model,extra)
      %`
        $$(#{li_pattern.to_json}).each(function(li){
          pie.mplist.update_li(li,#{str.to_json});
        });
      `
    end

    def _build_new_mplist_js(selector,extra)
      model = _get_model(selector)
      ul_pattern = _get_ul_pattern(selector)

      prev_model = extra[:prev]
      prev_model_html_id = prev_model.nil? ? nil : (dom_id prev_model)

      str = context.content_tag_for :li,model,:class=>'mli' do
        _get_partial_str(:form,model,extra)
      end

      %`
        $$(#{ul_pattern.to_json}).each(function(ul){
          pie.mplist.open_new_form(#{str.to_json},ul,#{prev_model_html_id.to_json});
        });
      `
    end

    def _get_ul_pattern(selector)
      case selector
        when ActiveRecord::Base
          "#mplist_#{build_ul_id selector}"
        when Array
          "#mplist_#{build_ul_id selector}"
        when Hash
          selector[:ul]
      end
    end

    def _get_li_pattern(selector)
      case selector
        when ActiveRecord::Base
          "##{dom_id selector}"
        when Array
          "##{dom_id selector.last}"
        when Hash
          selector[:li]
        else
          selector
      end
    end

    def _get_model(selector)
      case selector
        when ActiveRecord::Base
          selector
        when Array
          selector.last
        when Hash
          selector[:model]
      end
    end

    def _get_partial_str(prefix,model,extra)
      partial = extra[:partial]
      locals = extra[:locals] || {}
      if partial.blank?
        partial = get_partial_of(model,prefix)
      end
      locals.merge!({get_sym_of(model)=>model})
      render :partial=>partial,:locals=>locals
    end

  end

  module MindpinUiRender::CellModule
    def cell(*args)
      model = args.first
      options = args.extract_options!

      options[:locals] ||= {}
      options[:partial] ||= "#{get_path_of_controller}/cell_#{controller.action_name}"

      _render_page(model,options)
    end

    private
      def _render_page(model,options)
        locals = case model
          when Symbol
            options[:locals]
          when ActiveRecord::Base
            {get_sym_of(model)=>model}.merge(options[:locals])
          when Hash
            options[:locals]
          else
            options[:locals]
        end
        position = context.params[:PL] || options[:position]
        
        html_str = (render :partial=>options[:partial],:locals=>locals)
        page<<"pie.cell.update_html(#{position.to_json},#{html_str.to_json})"
      end
  end

  include MindpinUiConvention
  include CellModule
  include MplistModule
  include FboxModule
end
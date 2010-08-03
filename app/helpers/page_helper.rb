module PageHelper
  
  def prepare_width(width)
    return width if width.to_s.last == '%'
    return "#{width}px"
  end

  # 生成render :partial=>'xxx/_meta_xxx',:locals=>{:xxx=>xxx}
  def meta(instance)
    return I18n.t("page.tags.object_deleted") if instance.blank?
    begin
      klass = instance.class
      path = get_partial_of_class("meta",klass)
      return (render :partial=>path,:locals=>{klass.name.demodulize.underscore.to_sym=>instance})
    rescue Exception => ex
      return ex
    end
  end

  # 获取当前页面显示主题字符串，如果没有默认是 'sapphire'
  def get_user_theme_str
    if @mindpin_layout.theme.blank?
      user = current_user

      # 个人主页特殊处理
      if [controller_name,action_name] == ["users","show"]
        user = User.find(params[:id])
      end

      return "sapphire" if user.blank?

      user.create_preference if user.preference.blank?
      theme = user.preference.theme
      theme = "sapphire" if theme.blank?
      return theme
    else
      @mindpin_layout.theme
    end
  end

  # 获取页面布局的container样式名
  def container_classname
    @get_container_classname ||= _layout_classname('container')
  end
  
  def head_classname
    @mindpin_layout.head_class || ''
  end

  # 获取页面布局的grid样式名
  def grid_classname
    @get_grid_classname ||= _layout_classname('grid')
  end

  def _layout_classname(prefix)
    return "#{prefix}_#{@mindpin_layout.grid}" if @mindpin_layout.grid
    return ''
  end

  # 加载页面布局的gridcss文件
  def grid_css
    case @mindpin_layout.grid
    when 24
      stylesheet_link_tag 'framework/grid_960_24',:media=>'screen, projection'
    when 19
      stylesheet_link_tag 'framework/grid_760_19',:media=>'screen, projection'
    when 'auto'
      stylesheet_link_tag 'framework/grid_auto',:media=>'screen, projection'
    end
  end

  # 加载css文件
  def require_css(cssname, iefix = false)
    csspath = cssname
    csspath = "views/#{csspath}" if !csspath.include?('/')
    render :partial=>'layouts/parts/require_css',:locals=>{:csspath=>csspath,:iefix=>iefix}
  end
  
  def render_tabs
    tabs_path = controller.class.name.downcase.sub('::','/').sub('controller','/tabs')
    begin
      render :partial=>tabs_path
    rescue Exception => ex
      ''
    end
  end

  include MindpinUiConvention
end

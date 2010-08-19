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

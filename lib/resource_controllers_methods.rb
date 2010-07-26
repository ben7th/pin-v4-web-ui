module ResourceControllersMethods
  # 增加这一句的目的是使得flash上传时，能够从url参数中获取session
  def set_cookie_only_to_false
    request.session_options['cookie_only'] = false if request.session_options
  end

  def build_entry
    controller_name = params[:controller]
    clazz = Class.class_eval(controller_name.classify)
    entry = clazz.new(params[controller_name.singularize])
    entry.user = current_user
    entry
  end
end

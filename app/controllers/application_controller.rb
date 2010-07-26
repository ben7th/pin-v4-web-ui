# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  include AuthenticatedSystem
  #include MindpinUiConvention
  include MplistRender
  include EtagGenerator

  before_filter :refresh_online_record , :fix_ie6_accept, :check_v09

  # 用来判定是否显示通告
  before_filter :show_announcement?
  def show_announcement?
    last_announ = Announcement.last
    return true if cookies[:show_announcement] == true || last_announ.blank?
    last_announcement_updated_at = last_announ.updated_at
    last_announ_time = cookies[:last_announcement_updated_at]
    if last_announ_time.blank? || last_announ_time && (Time.parse(last_announ_time) < last_announcement_updated_at)
      cookies[:last_announcement_updated_at] = last_announcement_updated_at
      cookies[:show_announcement] = true
      return 
    end
    cookies[:show_announcement] = false
    return true
  end

  helper :all
  protect_from_forgery

  # 通过插件开启gzip压缩
  after_filter OutputCompressionFilter

  private
  def refresh_online_record
    if(request.format==Mime::HTML) && ( require_refresh_online_records? || is_time_to_refresh_online_records? )
      return OnlineRecord.refresh(current_user) if logged_in?
      session[:online_key] = OnlineRecord.refresh_anonymous(session[:online_key])
      session[:last_time_online_refresh] = Time.now
    end
  end

  # 现在是否可以刷新在线状态记录了？
  def is_time_to_refresh_online_records?
    Time.now - session[:last_time_online_refresh] > 5.minutes
  end

  # 是否需要刷新在线状态记录？
  def require_refresh_online_records?
    session[:last_time_online_refresh].blank?
  end

  # 修正IE6浏览器请求头问题
  def fix_ie6_accept
    if /MSIE 6/.match(request.user_agent) && request.env["HTTP_ACCEPT"]!='*/*' && !/.*\.gif/.match(request.url)
      request.env["HTTP_ACCEPT"] = '*/*'
    end
  end

  # 检测用户是否是老用户，是的话跳转到升级页面，不是则进入主页
  def check_v09
    return if self.controller_name=="index"&&self.action_name=='v09'
    return if self.controller_name=="index"&&self.action_name=="v09_up"
    return if self.controller_name=="sessions"&&self.action_name=='destroy'
    if logged_in? && current_user.is_v09?
      return redirect_to '/v09'
    end
  end

  def is_flash_request?
    !!(request.env['HTTP_USER_AGENT'] =~ /^(Adobe|Shockwave) Flash/)
  end

  def pre_page
    10
  end

  before_filter :init_layout
  before_filter :set_current_user
  around_filter :catch_access_exception
  around_filter :transaction_filter

  protected
  def init_layout
    @mindpin_layout = MindpinLayout.new
  end

  def set_current_user
    Authorization.current_user = current_user
  end

  def catch_access_exception
    begin
      yield
    rescue Authorization::NotAuthorized => ex
      render :text=>ex.message,:status=>403
    rescue ActionView::MissingTemplate => ex
      if RAILS_ENV=='production'
        render :update do |page|
          page<< %`show_fbox('参数或模板错误');`
        end
      else
        raise ex
      end
    end
  end

  def transaction_filter
    return yield if request.get?
    ActiveRecord::Base.transaction do
      yield
    end
  end

  # -----1月23日的分割线--------------
  def render_page(*args,&block)
    render_ui do |ui|
      ui.cell *args
      yield(ui.page) if block_given?
    end
  end

  # 2月26号 新渲染器
  def render_ui(options=nil,&block)
    render :update do |page|
      context = instance_exec{@template}
      yield MindpinUiRender.new(context,page,&block)
    end
  end
  
end
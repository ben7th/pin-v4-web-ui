class SessionsController < ApplicationController
  skip_before_filter :user_redirect

  include SessionsMethods

  def new
    render :layout=>'black_index',:template=>'auth/login'
  end

  def v09_new
    render :layout=>'black_index'
  end

  def new_ajax
    if request.xhr?
      session[:return_to] = params[:return_url] if params[:return_url]
      render_ui do |ui|
        ui.fbox :show,:partial=>"sessions/form_login_ajax"
      end
    end
  end

  # 弹出框登录界面
  def login_fbox
    render :layout=>false
  end

  # 弹出框登陆界面提交后的处理
  def login_fbox_create
    self.current_user = params[:v09].blank? ? User.authenticate(params[:email],params[:password]) : User.v09_authenticate(params[:name],params[:password])
    responds_to_parent do
      logged_in? ? login_success_and_refresh_page : login_failure
    end
  end

  # 登陆成功并刷新页面
  def login_success_and_refresh_page
    render_ui do |ui|
      ui.page << %`window.location.href=window.location.href;`
    end
  end

  # 登录失败，弹出提示
  def login_failure
    render_ui do |ui|
      ui.page << %`
        $$('.common_form .form_error').each(function(error){
          error.removeClassName('hide');
          error.update("<div class='flash-error'>用户名/密码不正确</div>");
        });
      `
    end
  end
  
  def create
    if params[:v09]
      return _v09_login
    end
    _login
  end

  def _login
    self.current_user=User.authenticate(params[:email],params[:password])
    if logged_in?
      after_logged_in()
      if session[:return_to]
        redirect_to session[:return_to]
        session[:return_to] = nil
        return
      end
      _redirect_index_or_default_app
    else
      flash[:error]="用户名/密码不正确"
      redirect_to login_url
    end
  end

  def _v09_login
    self.current_user=User.v09_authenticate(params[:name],params[:password])
    if logged_in?
      after_logged_in()
      _redirect_index_or_default_app
    else
      flash[:error]="用户名/密码不正确"
      redirect_to v09_login_url
    end
  end

  def _redirect_index_or_default_app
    if current_user.is_admin?
      return redirect_to "/admin/index"
    end
    default_app = current_user.default_app
    if default_app
      return redirect_to "/app/#{default_app.name}"
    end
    redirect_to "/"
  end
  
  def destroy
    user=current_user
    if user
      reset_session_with_online_key()
      # 登出时销毁cookies令牌
      destroy_cookie_token()
      destroy_online_record(user)
    end
    redirect_to root_url
  end

end

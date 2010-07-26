class UsersController < ApplicationController
  before_filter :login_required,:only => [:edit,:update]

  include SessionsMethods

  def new
    online_key=session[:online_key]
    reset_session
    session[:online_key]=online_key
    @user=User.new
    render :layout=>'black_page'
  end

  def create
    # 出于安全性考虑，新用户注册时销毁cookies令牌
    destroy_cookie_token
    @user=User.new(params[:user])

    # 生成验证码、验证码过期时间、初始激活状态
    @user.create_activation_code

    if @user.save
      # flash[:success]="注册成功，请使用新帐号登陆"
      login_after_create(@user)
    else
      flash.now[:error]=@user.errors.first[1]
      render :layout=>'black_page',:action => 'new'
    end
  end

  # 联系人提交的注册
  def invit_create
    # 出于安全性考虑，新用户注册时销毁cookies令牌
    destroy_cookie_token
    @user=User.new(params[:user])

    # 直接添加为联系人
    invitation = Invitation.find_by_uuid(params[:uuid])
    host = invitation.host

    # 直接激活
    @user.activate

    if @user.save
      @user.add_contact_with_each_other(host)
      # flash[:success]="注册并激活成功，请使用新帐号登陆"
      login_after_create(@user)
    else
      flash.now[:error]=@user.errors.first[1]
      render :layout=>'black_page',:template=>"/invitations/form_register",:locals=>{:invitation=>invitation,:user=>@user}
    end
  end

  def login_after_create(user)
    self.current_user=user
    after_logged_in()
    flash[:success] = '注册成功，您现在已经是 MindPin ei 的用户'
    redirect_to '/welcome'
  end

  def show
    @user=User.find(params[:id])
    if logged_in? && @user == current_user
      @user_shares = @user.my_and_contacting_shares.paginate(:page => params[:page] ,:per_page=>30 )
    else
      @user_shares = @user.shares.paginate(:page => params[:page] ,:per_page=>30 )
    end
    respond_to do |format|
      format.html {} # 这一行必须有而且必须在下面这行之前，否则IE里会出问题
      format.xml {render :xml=>@user.to_xml(:only=>[:id,:name,:created_at],:methods=>:logo)}
    end
  end

  def edit
    # 如果被请求的用户不是当前登录用户，则跳转到show方法
    return if is_current_user?
    redirect_to :action=>'show'
  end

  def edit_logo
    return if is_current_user?
    redirect_to :action=>'show'
  end

  def logo
    return redirect_to :action=>'show' if !is_current_user?
    if !params[:copper]
      current_user.update_attributes({:logo=>params[:user][:logo]})
      return render :template=>"users/copper_logo"
    end
    _copper
  end

  def _copper
    current_user.copper_logo(params)
    return redirect_to :action => "edit"
  end

  def update
    if is_current_user?
      @user=User.find(params[:id])
      s1=params[:user]
      @user.password=s1[:password]
      @user.password_confirmation=s1[:password_confirmation]
      @user.update_attributes(s1)
      if @user.save
        flash.now[:notice]="用户#{@user.name}的信息已经成功修改"
      else
        (@user.errors).each do |*error|
          flash.now[:error]=error*' '
        end
      end
      responds_to_parent do
        render_ui do |ui|
          ui.cell @user,:partial=>"users/cell_edit",:position=>:paper
          ui.page << %`
              $$("#logo_user_#{@user.id}").each(function(logo){
                logo.src = "#{@user.logo.url}";
              })
              $$("#logo_user_#{@user.id}_tiny").each(function(logo){
                logo.src = "#{@user.logo.url(:tiny)}";
              })
          `
        end
      end
    end
  end

  def activate
    if !params[:activation_code].blank?
      @user = User.find_by_activation_code(params[:activation_code])
      if @user && !@user.activated?
        self.current_user = @user
        @user.activate
        return render :layout=>'black_page',:template=>"users/activate_success"
      end
    end
    @failure = true
    return render :layout=>'black_page',:template=>"users/activate_success"
  end

  def send_activation_mail
    if !current_user.activated?
      current_user.send_activation_mail
      flash.now[:notice]="激活邮件已发送，请注意查收"
      render_ui do |ui|
        ui.cell current_user,:partial=>"users/cell_edit",:position=>:paper
      end
    end
  end
  
  # 忘记密码时，填写邮件的表单
  def forgot_password_form
    render :layout=>'black_page'
  end

  # 根据邮件地址发送邮件
  def forgot_password
    @user = User.find_by_email(params[:email])
    if !@user.blank?
      @user.forgot_password
      flash[:success] = "包含重设密码链接的邮件已经发送到邮箱 #{params[:email]}，请留意。"
      redirect_to("/forgot_password_form")
      return
    end
    flash[:error] = "对不起，不存在邮箱为 #{params[:email]} 的用户。"
    redirect_to("/forgot_password_form")
  end

  # 重置密码的表单
  def reset_password
    @user = User.find_by_reset_password_code(params[:pw_code])
    return redirect_to("/") if @user.blank?
    render :layout=>'black_page'
  end

  # 重置密码
  def change_password
    @user = User.find_by_reset_password_code(params[:pw_code])
    return redirect_to("/") if @user.blank?

    pu = params[:user]

    if !pu[:password].blank? && pu[:password] == pu[:password_confirmation]
      if @user.update_attributes(:password=>pu[:password],:reset_password_code=>nil)
        flash.now[:success] = "已成功为 #{@user.name} 重设密码"
        render :layout=>'black_page',:template=>"users/reset_password_success"
        return
      end
    end
    @user.errors.add(:password,"密码不能为空") if params[:user][:password].blank?
    @user.errors.add(:password_confirmation,"密码和确认密码必须相同") if params[:user][:password] != params[:user][:password_confirmation]
    flash.now[:error] = @user.errors.first[1] if !@user.errors.blank?
    render :layout=>'black_page',:template=>"users/reset_password"
  end

  private
  def is_current_user?
    session[:user_id].to_s==params[:id]
  end

end

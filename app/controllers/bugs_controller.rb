class BugsController < ApplicationController

  before_filter :per_load

  def new
    @bug = Bug.new
    return render :layout=>'black_page'
  end

  def create
    @bug = Bug.new(params[:bug])
    @bug.user_agent = request.user_agent
    return _create_success if _create_bug
    _create_failure
  end
  
  def _create_bug
    if logged_in?
      @bug.user = current_user
      return @bug.save
    end
    @bug.user_ip = request.remote_ip
    return @bug.save_with_captcha
  end
  
  def _create_failure
    flash.now[:error]=@bug.errors.first[1]
    responds_to_parent do
      render_ui do |ui|
        ui.page << "jQuery('#new_bug').html(#{(render :partial=>"bugs/form_bug",:locals=>{:bug=>@bug}).to_json})"
      end
    end
  end

  def _create_success
    @bug.to_share if params[:share]
    responds_to_parent do
      render_ui do |ui|
        ui.page << %`try{`
        ui.mplist :insert,@bug,:prev=>'TOP'
        ui.page << "$('new_bug').update(#{(render :partial=>"bugs/form_bug",:locals=>{:bug=>Bug.new}).to_json})"
        ui.page << "$$('form#new_bug')[0].reset();"
        ui.page << %`}catch(e){}`
      end
    end
  end

  def index
    @bugs = Bug.find(:all,:order=>"created_at desc").paginate(:page => params[:page] ,:per_page=>10 )
    render :layout=>'black_index'
  end

  def show
    render :layout=>"black_page"
  end

  def update
    case params[:operate]
    when 'handle'
      @bug.handled!
      return render_ui do |ui| ui.mplist :update,@bug end
    when 'close'
      @bug.closed!
      return render_ui do |ui| ui.mplist :update,@bug end
    end
  end

  def destroy
    if current_user.is_admin?
      @bug.destroy
      render_ui do |ui|
        ui.mplist :remove,@bug
      end
      return
    end
    return render :status=>403,:text=>"无权限"
  end

  def per_load
    @bug = Bug.find(params[:id]) if params[:id]
  end
end
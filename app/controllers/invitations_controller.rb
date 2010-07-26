class InvitationsController < ApplicationController

  before_filter :pre_load

  def index
    
  end

  def new
  end

  def create
    invitation = current_user.invitations.new(params[:invitation])
    if invitation.save
      render_ui do |ui|
        flash.now[:notice] = "已经向这个朋友发起了邀请"
        ui.cell :position=>:paper,:partial=>"invitations/form_invitation",:locals=>{:invitation=>invitation }
      end
      return
    end
    render_ui do |ui|
      ui.cell :position=>:paper,:partial=>"invitations/form_invitation",:locals=>{:invitation=>invitation }
    end
  end

  # 邀请联系人注册，朋友来注册的form表单
  def invit_signup
    invitation = Invitation.find_by_uuid(params[:uuid])
    if invitation
      render :layout=>'black_page',:template=>"/invitations/form_register",:locals=>{:invitation=>invitation,:user=>User.new}
    end
  end

  def pre_load
  end
  
end

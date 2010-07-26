class Admin::AnnouncementsController < ApplicationController
  filter_access_to :all, :except=>[:show]
  before_filter :per_load

  def index
    @announcements = Announcement.paginate(:all,:order=>"updated_at desc",:page => params[:page] ,:per_page=>10 )
  end

  def new
    render_ui do |ui|
      ui.fbox :show,:title=>"新公告",:partial=>"/admin/announcements/form_announcement",:locals=>{:announcement=>Announcement.new}
    end
  end

  def create
    announcement = Announcement.new(params[:announcement])
    if announcement.save
      render_ui do |ui|
        ui.mplist :insert,announcement,:partial=>"/announcements/info_announcement",:locals=>{:announcement=>announcement},:prev=>'TOP'
        ui.fbox :close
      end
      return
    end
    render_ui do |ui|
      ui.fbox :show,:title=>"新公告",:partial=>"/admin/announcements/form_announcement",:locals=>{:announcement=>announcement}
    end
  end

  def edit
    render_ui do |ui|
      ui.fbox :show,:title=>"修改公告",:partial=>"/admin/announcements/form_announcement",:locals=>{:announcement=>@announcement}
    end
  end

  def update
    if @announcement.update_attributes(params[:announcement])
      render_ui do |ui|
        ui.mplist :update,@announcement,:partial=>"/announcements/info_announcement"
        ui.fbox :close
      end
      return
    end
    render_ui do |ui|
      ui.fbox :show,:title=>"修改公告",:partial=>"/admin/announcements/form_announcement",:locals=>{:announcement=>@announcement}
    end
  end

  def destroy
    if @announcement.destroy
      render_ui do |ui|
        ui.mplist :remove, @announcement
      end
    end
  end

  def per_load
    @announcement = Announcement.find(params[:id]) if params[:id]
  end

end

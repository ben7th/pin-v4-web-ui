class AnnouncementsController < ApplicationController

  before_filter :per_load
  def per_load
    @announcement = Announcement.find(params[:id]) if params[:id]
  end

  def index
    @announcements = Announcement.paginate(:all,:order=>"updated_at desc",:page => params[:page] ,:per_page=>10 )
  end

  def show
  end

  def last
    @announcement = Announcement.last
    render :layout=>false
  end

  def last_comments
    @last_comments = @announcement.comments.by_created_at(:desc).limited(10)
    render :layout=>false
  end

end

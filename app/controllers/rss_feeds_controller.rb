class RssFeedsController < ApplicationController
  before_filter :pre_load
  before_filter :login_required,:only=>[:claim_tip,:claim]

  def index
    @rss_feeds = RssFeed.all.paginate(:page => params[:page] ,:per_page=>20 )
  end

  def create
  end

  def show
    if params[:tabi]
      return render :file=>"rss_feeds/show_tabi"
    end
  end

  def claim_tip
  end

  def claim
    if !@rss_feed.claim(current_user)
      content = "很遗憾，认领没有成功，请详细查看认领说明，确认您的操作是否正确"
      flash[:notice] = content
      redirect_to :action => :claim_tip
    end
  end

  def pre_load
    @rss_feed = RssFeed.find(params[:id]) if params[:id]
  end
end
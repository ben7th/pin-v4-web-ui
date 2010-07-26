class SubscriptionEntriesController < ApplicationController

  before_filter :per_load
  before_filter :login_required,:only=>[:index]

  # 这里的创建订阅，是有区别于entries中统一的创建subscription——entry
  # 这个请求时来自rss_feed的show页面，此时的rss源已经经过解析是可见的
  def create
    unless @rss_feed.subscripted_by?(current_user)
      subscription_entry = SubscriptionEntry.create(:rss_feed=>@rss_feed,:user=>current_user)
      Entry.create(:resource=>subscription_entry,:user=>current_user)
    end
    render_ui do |ui| end
  end

  def update
    items = @subscription_entry.rss_feed.update_items
    if items.size != 0
      render_ui do |ui|
        items.reverse.each do |item|
          ui.mplist :insert,item,:partial=>"/rss_items/info_rss_item",:locals=>{:rss_item=> item},:prev=>:TOP
        end
      end
      return
    end
    return render_ui do |ui| end
  end

  def index
    render :template=>"/reader/subscriptions"
  end

  def show
    render_page @subscription_entry,:partial=>"/reader/parts/subscription"
  end
  
  def per_load
    @subscription_entry = SubscriptionEntry.find(params[:id]) if params[:id]
    @rss_feed = RssFeed.find(params[:rss_feed_id]) if params[:rss_feed_id]
  end

end


class RssItemsController < ApplicationController
  before_filter :pre_load
  
  def show
  end

  def pre_load
    @rss_item = RssItem.find(params[:id]) if params[:id]
  end
end
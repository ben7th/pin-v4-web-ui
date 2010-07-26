class ReadingsController < ApplicationController

  before_filter :per_load

  # 某人的阅读记录
  def index
    @user ||= current_user
    @readings = Reading.find(:all,:conditions=>{:user_id=>@user.id},:order=>"updated_at desc",:limit=>20)
  end

  def create
    reading = Reading.find_by_readable_id_and_readable_type_and_user_id(@readable.id,@readable.class.to_s,current_user.id)
    if reading.blank?
      Reading.create(:readable=>@readable,:user=>current_user)
      render_ui do |ui|
        ui.page << %`
        var cont_span = $('rss_feed_#{@readable.rss_feed.id }_unread_items_count');
        if(cont_span){
          var count = parseInt(cont_span.innerHTML.sub("(","").sub(")",""));
          cont_span.update('(' + (count-1) + ')');
          if(count == 1){
            cont_span.addClassName("hide")
            cont_span.up("div").removeClassName("bold")
          }
        }
        `
      end
      return 
    end
    return render :status=>200,:text=>""
  end

  def unread
    reading = Reading.find_by_readable_id_and_readable_type_and_user_id(@readable.id,@readable.class.to_s,current_user.id)
    reading.destroy
    render_ui do |ui|
      ui.page << %`
        var cont_span = $('rss_feed_#{@readable.rss_feed.id }_unread_items_count');
        if(cont_span){
          var count = parseInt(cont_span.innerHTML.sub("(","").sub(")",""));
          cont_span.update('(' + (count+1) + ')');
          if(count == 0){
            cont_span.removeClassName("hide")
            cont_span.up("div").addClassName("bold")
          }
        }
      `
    end
  end

  def per_load
    @user = User.find(params[:user_id]) if params[:user_id]
    @reading = Reading.find(params[:id]) if params[:id]
    @readable = RssItem.find(params[:rss_item_id]) if params[:rss_item_id]
  end
  
end

class CollectorController < ApplicationController

  def new
    @entry = Entry.new
    @web_site_url = params[:web_site_url]
    @title = params[:title] || ''
  end

  def create
    @entry = Entry.new(params[:entry])
    @entry.user = current_user
    @entry.from = "采集器"
    if @entry.save
      if params[:entry][:resource_meta][:type] == "BookmarkEntry"
        return _bookmark_summary_rjs
      end
      flash.now[:success]="资料已保存，<a href='/entries/#{@entry.id}' target='_blank'>点此查看</a>"
    end
    @web_site_url = params[:web_site_url]
    @title = params[:title]
    render :action => :new
  end

  def _bookmark_summary_rjs
    render :update do |page|
      @bookmark_entry_url = params[:entry][:resource_meta][:data][:url]
      @bookmark_entry_title = params[:entry][:resource_meta][:data][:title]
      page << %`
        var str = #{render(:partial=>"collector/parts/bookmark_summary",:locals=>{:bookmark_entry_url=>@bookmark_entry_url,:bookmark_entry_title=>@bookmark_entry_title}).to_json}
        $("bookmark_summary").update(str)
      `
    end
  end

end

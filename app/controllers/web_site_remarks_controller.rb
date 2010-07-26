class WebSiteRemarksController < ApplicationController

  before_filter :pre_load

  def index
    @remarks = @web_site.comments
  end

  def create
    @remark = @web_site.comments.new(params[:comment])
    @remark.creator = current_user
    if @remark.save
      return _insert_mplist if params[:from] == "index"
      _render_summary
    end
  end

  def _insert_mplist
    render_ui do |ui|
      ui.mplist :insert,[@web_site,@remark],:partial=>"comments/info_comment"
      ui.page << "$('remark_content').value = ''"
    end
  end

  def _render_summary
    render :update do |page|
      page << %`
        var str = #{render(:partial=>"web_site_remarks/parts/remarks",:locals=>{:web_site=>@web_site}).to_json}
        $("remark_comments").update(str)
        $("remark_content").value = ""
      `
    end
  end

  def pre_load
    if action_name == "create"
      @web_site = WebSite.create_web_site(params[:domain])
    end
    if action_name == "index"
      @web_site = WebSite.find(params[:web_site_id])
    end
  end
end

class ReportsController < ApplicationController
  before_filter :pre_load

  def index
  end
  
  def new
    report = Report.new
    render_ui do |ui|
      ui.fbox :show,:partial=>"/reports/form_report",:locals=>{:report=>report,:reportable=>@reportable},:title=>"不良信息举报"
    end
  end

  def create
    report = Report.new(params[:report])
    report.reportable = @reportable
    report.creator = current_user
    if report.save
      render_ui do |ui|
        ui.page.close_box
        ui.page << "$('report_button').replace('已经举报')"
      end
      return
    end
    render_ui do |ui|
      ui.fbox :show,:partial=>"/reports/form_report",:locals=>{:report=>report,:reportable=>@reportable},:title=>"不良信息举报"
    end
  end
  
  def pre_load
    @reportable = Entry.find(params[:entry_id]) if params[:entry_id]
    @reportable = RssItem.find(params[:rss_item_id]) if params[:rss_item_id]
  end
end

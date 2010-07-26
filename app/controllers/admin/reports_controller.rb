class Admin::ReportsController < ApplicationController

  before_filter :per_load

  def index
    @reports = Report.all
  end

  def update
    @report.handle_by_admin(params[:forbidden])
    render_ui do |ui|
      ui.mplist :update,@report,:partial=>"/admin/reports/info_report",:locals=>{:report=>@report}
    end
  end

  def per_load
    @report = Report.find(params[:id]) if params[:id]
  end
  
end

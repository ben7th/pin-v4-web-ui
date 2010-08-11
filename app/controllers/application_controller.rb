# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  include MplistRender

  helper :all
  protect_from_forgery

  # 通过插件开启gzip压缩
  after_filter OutputCompressionFilter

  before_filter :init_layout
  def init_layout
    @mindpin_layout = MindpinLayout.new
  end

  # -----1月23日的分割线--------------
  def render_page(*args,&block)
    render_ui do |ui|
      ui.cell *args
      yield(ui.page) if block_given?
    end
  end

  # 2月26号 新渲染器
  def render_ui(options=nil,&block)
    render :update do |page|
      context = instance_exec{@template}
      yield MindpinUiRender.new(context,page,&block)
    end
  end
  
end
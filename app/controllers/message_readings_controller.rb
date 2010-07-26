class MessageReadingsController < ApplicationController
  before_filter :login_required
  before_filter :per_load

  # 删除（隐藏）多个收件箱里的消息
  def destroys
    deleted_messages = case params[:display_mode]
    when "draft"
      _destroy_draft_messages
    when "in","out"
      _hide_messages
    end
    render_ui do |ui|
      deleted_messages.each do |m|
        ui.mplist(:remove,m)
      end
      ui.page.update_inbox_unread_messages_count
    end
  end

  # 隐藏收件箱或发件箱的信息
  def _hide_messages
    messages = Message.find(params[:message_ids])
    message_readings = messages.map{|message|message.reading_of!(current_user)}
    message_readings.each do |message_reading|
      message_reading.hide!
    end
    messages
  end

  # 删除草稿箱时做特殊的处理
  def _destroy_draft_messages
    params[:message_ids].map do |message_id|
      message = Message.find(message_id)
      message.draft_messages_of(current_user).each{|draft_message|draft_message.destroy}
      message
    end
  end

  # 标记多个信息
  def mark
    unread = params[:unread]
    @messages = Message.find(params[:message_ids])
    @message_readings = @messages.map{|message|message.reading_of!(current_user)}
    @message_readings.each {|message_reading| message_reading.unread!} if unread == true || unread == "true"
    @message_readings.each {|message_reading| message_reading.read!} if unread == false || unread == "false"
    render_ui do |ui|
      @messages.each do |m|
        ui.mplist(:update,m,:partial=>'messages/info_message',:locals=>{:display_mode=>params[:display_mode],:checked=>true})
      end
      ui.page.update_inbox_unread_messages_count
    end
  end

  def per_load
  end
end
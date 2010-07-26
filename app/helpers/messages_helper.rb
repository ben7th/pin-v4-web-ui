module MessagesHelper
  def update_inbox_unread_messages_count
    count_str = page.context.current_user.inbox_unread_message_count_str
    page << %`
      $$("#user_info_unread_count").each(function(x){x.update('#{count_str}')})
      $$("#total_unread_count").each(function(x){x.update('#{count_str}')})
    `
  end

  # 收件箱和发件箱中，显示的消息的主题
  def message_title(title_message,content_message)
    title = title_message.title
    content = content_message.content
    "<span class='mt'>#{truncate_u title,12}</span><span class='ct'> - #{truncate_u content,24}</span>"
  end

  def visible_participants(message,user)
    message.logic_participants.map{|u|u==user ? '我':u.name}*","
  end

  def visible_messages_count(message,user)
    count = message.in_messages_of(user).count
    "(#{count})" if count.to_i > 1
  end

  def visible_draft_count(message,user)
    dcount = message.draft_number(user)
    "(#{dcount})" if (dcount)>1
  end

  # 是否隐藏表单中的标题输入框
  def hidden_title_input?(message)
    hidden_title_input = false
    if message.reply_message && (message.reply_message.reply_default_title == form_show_title(message) )
      hidden_title_input = true
    end
    return hidden_title_input
  end

  # 是否隐藏表单中的增加参与者框
  def hidden_participants_input?(message)
    hidden_participants_input = false
    if message.reply_message && message.participants.blank?
      hidden_participants_input = true
    end
    return hidden_participants_input
  end

    # 供表单显示标题
  def form_show_title(message)
    if !message.reply_message.blank? && message.new_record? && message.errors.count == 0
      message.reply_message.reply_default_title
    else
      message.title
    end
  end

  # 供表单显示参与者
  def form_show_participants(message)
    if !message.reply_message.blank? && message.new_record? && message.errors.count == 0
      []
    else
      message.participants
    end
  end

end

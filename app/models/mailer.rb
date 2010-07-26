class Mailer < ActionMailer::Base
  helper :datetime
  # 发送密码重设
  def forgotpassword(user)
    @recipients = user.email
    @from = 'MindPin<noreply@mindpin.com>'
    @body = {'user' => user}
    @subject = "MindPin密码重设邮件。"
    @sent_on = Time.now
    @content_type = "text/html"
  end

  # 用户激活邮件
  def activation(user)
    @recipients = user.email
    @from = 'MindPin<noreply@mindpin.com>'
    @body = {'user' => user}
    @subject = "MindPin用户激活邮件。"
    @sent_on = Time.now
    @content_type = "text/html"
  end

  def invitation(invitation)
    @recipients = invitation.contact_email
    @from = 'MindPin<noreply@mindpin.com>'
    @body = {'invitation' => invitation}
    @subject = "MindPin用户邀请邮件。"
    @sent_on = Time.now
    @content_type = "text/html"
  end

  # type=> "normal","zip"
  def send_entry(entry,user,type)
    @recipients = user.email
    @from = 'MindPin<noreply@mindpin.com>'
    @body = {'user' => user}
    @subject = "MindPin资料邮件。"
    @sent_on = Time.now
    @content_type = "text/html"
    _add_attachment_by_type(entry.resource,type)
  end

  # 给老用户发送升级公告
  def send_upgrade_v09(user)
    @recipients = user.email
    @from = 'MindPin<noreply@mindpin.com>'
    @body = {'user' => user}
    @subject = "MindPin升级邮件。"
    @sent_on = Time.now
    @content_type = "text/html"
  end

  # 反馈bug意见者
  def respond_to_bug_commmiter(bug,comment)
    if RAILS_ENV=="production"
      @recipients = bug.user.email
    else
      @recipients = "chinachengliwen@gmail.com"
    end
    @from = 'MindPin<noreply@mindpin.com>'
    @body = {'bug' => bug,'comment'=>comment}
    @subject = "MindPin管理员回复邮件"
    @sent_on = Time.now
    @content_type = "text/html"
  end

  private
  def _add_attachment_by_type(resource,type)
    if type == "normal"
      _add_attachment(resource.content_content_type,
        resource.title,File.read(resource.content.path))
    elsif type == "zip"
      _add_attachment("application/zip","#{resource.title}.zip",
        File.read(resource.to_zip))
    end
  end

  def _add_attachment(content_type,filename,body)
    attachment content_type do |a|
      a.filename = filename
      a.body = body
    end
  end

end
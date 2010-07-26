class UserObserver < ActiveRecord::Observer

  def send_forgotpassword_mail(user)
    begin
      Mailer.deliver_forgotpassword(user)
    rescue Exception=>e
    rescue Net::SMTPFatalError
      p "Net::SMTPFatalError"
    rescue Net::SMTPServerBusy, Net::SMTPUnknownError, Net::SMTPSyntaxError, TimeoutError
      p "Net::SMTPServerBusy, Net::SMTPUnknownError, Net::SMTPSyntaxError, TimeoutError"
    end
  end

  def send_activation_mail(user)
    begin
      Mailer.deliver_activation(user)
    rescue Exception=>e
    rescue Net::SMTPFatalError
      p "Net::SMTPFatalError"
    rescue Net::SMTPServerBusy, Net::SMTPUnknownError, Net::SMTPSyntaxError, TimeoutError
      p "Net::SMTPServerBusy, Net::SMTPUnknownError, Net::SMTPSyntaxError, TimeoutError"
    end
  end
end

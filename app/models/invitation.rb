class Invitation < ActiveRecord::Base

  def initialize(*args)
    super(*args)
    self.uuid ||= UUID.random_create.to_s
  end
  
  belongs_to :host,:class_name=>"User"
  attr_accessor :content

  validates_presence_of :host
  validates_presence_of :contact_email
  validates_format_of :contact_email,:with=>/^([A-Za-z0-9_]+)([\.\-\+][A-Za-z0-9_]+)*(\@[A-Za-z0-9_]+)([\.\-][A-Za-z0-9_]+)*(\.[A-Za-z0-9_]+)$/

  def validate
    invite_self_validate
    invite_registered_user_validate
    repeat_invite_validate
  end

  def invite_registered_user_validate
    user = User.find_by_email(self.contact_email)
    if !user.blank?
      errors.add(:contact_email,"该用户已注册")
    end
  end

  def invite_self_validate
    if self.host.email == self.contact_email
      errors.add(:contact_email,"不能给自己发送邀请")
    end
  end

  def repeat_invite_validate
    invitation = Invitation.find_by_contact_email(self.contact_email)
    if !invitation.blank?
      errors.add(:contact_email,"不能重复发送邀请")
    end
  end

  after_create :send_email_to_contact
  def send_email_to_contact
    begin
      Mailer.deliver_invitation(self)
    rescue Exception=>e
    rescue Net::SMTPFatalError
      p "Net::SMTPFatalError"
    rescue Net::SMTPServerBusy, Net::SMTPUnknownError, Net::SMTPSyntaxError, TimeoutError
      p "Net::SMTPServerBusy, Net::SMTPUnknownError, Net::SMTPSyntaxError, TimeoutError"
    end
  end

  def registered?
    user = User.find_by_email(self.contact_email)
    return true if !user.blank?
    return false
  end

  module HostMethods
    def self.included(base)
      base.has_many :invitations,:foreign_key=>"host_id"
    end
  end
end

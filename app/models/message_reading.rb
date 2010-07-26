# == Schema Information
# Schema version: 20091223090135
#
# Table name: message_readings
#
#  id               :integer(4)      not null, primary key
#  message_topic_id :integer(4)      not null
#  receiver_id      :integer(4)      not null
#  unread_count     :integer(4)      default(1)
#  hidden           :boolean(1)      not null
#  created_at       :datetime        
#  updated_at       :datetime        
#

class MessageReading < ActiveRecord::Base
  belongs_to :receiver,:class_name=>'User',:foreign_key=>'receiver_id'
  belongs_to :message

  before_save :change_hidden_status_by_unread_count

  def change_hidden_status_by_unread_count
    self.hidden = false if self.unread_count > 0
    return true #<--这一句不能漏，否则会导致因为before_save 返回false而不能保存
  end

  # 把当前阅读记录标为：已读
  # 如果已经是已读状态，则不修改数据库
  def read!
    if is_unread?
      self.update_attributes(:unread_count=>0,:unread=>false)
    end
  end

  # 把当前阅读记录标为：未读
  # 如果已经是未读状态，则不修改数据库
  def unread!
    unless is_unread?
      self.update_attributes(:unread=>true)
    end
  end

  def is_unread?
    self.unread_count != 0 || self.unread
  end

  def hide!
    self.update_attributes(:hidden=>true,:unread_count=>0)
  end

end

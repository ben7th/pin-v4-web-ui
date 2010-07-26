# == Schema Information
# Schema version: 20091223090135
#
# Table name: preferences
#
#  id             :integer(4)      not null, primary key
#  user_id        :integer(4)      not null
#  auto_popup_msg :boolean(1)      default(TRUE)
#  created_at     :datetime        
#  updated_at     :datetime        
#

class Preference < ActiveRecord::Base
  belongs_to :user

  module UserMethods
    def self.included(base)
      base.after_create :create_preference
      base.has_one :preference,:dependent => :destroy
    end
  end
end
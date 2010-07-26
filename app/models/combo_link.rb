# == Schema Information
# Schema version: 20091223090135
#
# Table name: combo_links
#
#  id           :integer(4)      not null, primary key
#  tag_id       :integer(4)      not null
#  tag_combo_id :integer(4)      not null
#  created_at   :datetime        
#  updated_at   :datetime        
#

class ComboLink < ActiveRecord::Base

  belongs_to :tag
  belongs_to :tag_combo
end

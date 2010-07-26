# == Schema Information
# Schema version: 20091223090135
#
# Table name: view_records
#
#  id          :integer(4)      not null, primary key
#  user_id     :integer(4)      not null
#  source_id   :integer(4)      not null
#  source_type :string(255)     default(""), not null
#  views       :integer(4)      default(0)
#  created_at  :datetime        
#  updated_at  :datetime        
#

class ViewRecord < ActiveRecord::Base
  belongs_to :user
  belongs_to :source,:polymorphic=>true
end

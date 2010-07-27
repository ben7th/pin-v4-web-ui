# == Schema Information
# Schema version: 20091223090135
#
# Table name: remarks
#
#  id               :integer(4)      not null, primary key
#  content          :text            default(""), not null
#  creator_id       :integer(4)      not null
#  markable_id      :integer(4)      not null
#  markable_type    :string(255)     default(""), not null
#  symbol           :string(255)     
#  version          :integer(4)      
#  to               :integer(4)      
#  from             :integer(4)      
#  paragraph_number :integer(4)      
#  at               :integer(4)      
#  type             :string(255)     
#  created_at       :datetime        
#  updated_at       :datetime        
#

class Remark::HighLight < Remark

  validates_presence_of :paragraph_number
  validates_presence_of :from
  validates_presence_of :to
  validates_presence_of :version
  validates_presence_of :markable
  validates_presence_of :creator

  def validate
    unless from < to
      errors.add_to_base("开始位置(form)应该小于结束位置(to)")
    end
  end
end
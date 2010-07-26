# == Schema Information
# Schema version: 20091223090135
#
# Table name: requirements
#
#  id          :integer(4)      not null, primary key
#  task_id     :integer(4)      not null
#  requirement :string(255)     default(""), not null
#  time_point  :datetime        
#  created_at  :datetime        
#  updated_at  :datetime        
#

class Requirement < ActiveRecord::Base
  using_access_control
  belongs_to :host,:polymorphic => true

  VALUES = ['File','Text']
  # TODO 稍后改成自动生成下面的枚举值
  FILE = 'File'
  TEXT = 'Text'
  
  validates_presence_of :kind
  validates_inclusion_of :kind,:in => Requirement::VALUES

  before_save :set_subject
  def set_subject
    self.subject=I18n.t("model.teaching.requirement.no_subject") if self.subject.blank?
  end

  # 根据资源，获得这个资源属于什么约束
  def self.get_require_by_entry(entry)
    case entry.resource
    when TextEntry then TEXT
    when FileEntry then FILE
    end
  end

  # 返回约束对应的Class对象
  def require_class
    case self.kind
    when TEXT then TextEntry
    when FILE then FileEntry
    end
  end

  # 返回约束类型
  def require_str
    case self.kind
    when TEXT then I18n.t('page.teaching.procedure_requirements.requirements_text_kind')
    when FILE then I18n.t('page.teaching.procedure_requirements.requirements_file_kind')
    end
  end

  module HostMethods
    def self.included(base)
      base.has_many :requirements,:as=>:host,:dependent=>:destroy
      base.has_one :requirement,:as=>:host,:dependent=>:destroy,:order=>"created_at desc"
    end
  end
end
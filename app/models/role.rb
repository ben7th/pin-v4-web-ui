# == Schema Information
# Schema version: 20091223090135
#
# Table name: roles
#
#  id   :integer(4)      not null, primary key
#  name :string(255)     default(""), not null
#

class Role < ActiveRecord::Base
  has_many :user_roles
  has_many :users,:through=>:user_roles
  
  validates_presence_of :name

  VALUES = ['Admin','Teacher','Student']

  # 根据角色名动态定义了一组方法
  # 使用时直接取 Role.admin Role.teacher Role.student 即可 简化代码
  class << self
    VALUES.each do |role_name|
      define_method role_name.downcase do
        Role.find_by_name(role_name)
      end
    end
  end
end

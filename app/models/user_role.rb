# == Schema Information
# Schema version: 20091223090135
#
# Table name: user_roles
#
#  id      :integer(4)      not null, primary key
#  user_id :integer(4)      not null
#  role_id :integer(4)      not null
#

class UserRole < ActiveRecord::Base
  using_access_control
  
  belongs_to :user
  belongs_to :role

  validates_presence_of :user
  validates_presence_of :role

  module UserMethods
    def self.included(base)
      base.has_many :user_roles
      base.has_many :roles,:through=>:user_roles
      
      base.send(:include,InstanceMethods)
    end

    module InstanceMethods
      Role::VALUES.each do |role_name|
        define_method "is_#{role_name.downcase}?" do
          self.role == role_name
        end
      end

      def is_super_admin?
        self.email == 'admin@mindpin.com'
      end
      # 得到当前用户的角色
      def role
        self.roles.blank? ? 'Common':self.roles[0].name
      end

      # 管理员修改用户的角色 <-- 此处需要重构，改为使用权限配置实现
      def modify_role_of_user(user,role)
        case role
        when Role then user.user_roles[0].update_attributes!(:role=>role)
        when String then user.user_roles[0].update_attributes!(:role=>Role.find_by_name(role))
        end
      end
    end
  end

  # 根据创建的用户以及类型创建用户的角色
  def self.create_user_role_by_type(user,user_type)
    case user_type
    when "teacher" then UserRole.create(:user=>user,:role=>Role.teacher)
    when "student" then UserRole.create(:user=>user,:role=>Role.student)
    when "admin" then UserRole.create(:user=>user,:role=>Role.admin)
    end
  end
  
end

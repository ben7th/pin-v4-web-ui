# == Schema Information
# Schema version: 20091223090135
#
# Table name: readings
#
#  id                :integer(4)      not null, primary key
#  resource_entry_id :integer(4)      not null
#  user_id           :integer(4)      not null
#  created_at        :datetime        
#  updated_at        :datetime        
#

class Reading < ActiveRecord::Base

  belongs_to :readable,:polymorphic => true
  belongs_to :user
  
  # 随机获取一个阅读对象
  def self.get_random_readable(user)
    # types = [Entry,RssItem]
    types = [RssItem]
    type = types[rand(types.size)]
    readable = type.get_random_readable_id_for_reads(user)
    return readable
  end

  # 创建或更新 user 对 readable 的阅读记录
  def self.update_reader_record(user,readable)
    reading = Reading.find_by_user_id_and_readable_id_and_readable_type(user.id,readable.id,readable.class.to_s)
    if reading.blank?
      Reading.create(:user=>user,:readable=>readable)
    else
      reading.update_attribute(:updated_at,Time.now)
    end
  end

  module UserMethods
    def self.included(base)
      base.has_many :resource_readings,:class_name=>'Reading',:foreign_key => 'user_id',:order=>"updated_at desc"
      # base.has_many :read_resources,:through => :resource_readings,:source=>:readable
    end

    # 该用户阅读 一些资源
    # arg 可以是一个资源对象，也可以是一个资源对象数组
    def reading_resources(arg)
      all_resources = []
      if arg.instance_of?(Entry) then all_resources << arg end
      if arg.instance_of?(Array) then all_resources = arg end
      all_resources.each do |resource|
        Reading.find_or_create_by_user_id_and_readable_id_and_readable_type(self.id,resource.id,resource.class.to_s)
      end
      return
    end

    # 近期的阅读记录
    def recent_readings(limit=6)
      Reading.find(:all,:conditions=>{:user_id=>self.id},:order=>"updated_at desc",:limit=>limit)
    end
  end

  module ReadableMethods
    def self.included(base)
      base.has_many :readings,:as=>:readable
      base.has_many :reading_users,:through => :readings,:source=>:user,:order=>"created_at desc"
    end
  end

end

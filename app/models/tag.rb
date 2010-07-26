# == Schema Information
# Schema version: 20091223090135
#
# Table name: tags
#
#  id         :integer(4)      not null, primary key
#  value      :string(255)     
#  created_at :datetime        
#  updated_at :datetime        
#

class Tag < ActiveRecord::Base
  belongs_to :user
  
  has_many :taggings
  has_many :combo_links
  has_many :tag_combos,:through => :combo_links

  named_scope :of_user,lambda {|user|
    return {
      :conditions=>['tags.user_id = ?',user.id]
    }
  }

  named_scope :used,:joins=>" inner join taggings on tags.id = taggings.tag_id ",:group=>"tags.id",:order=>" count(tags.id) desc,tags.updated_at desc"

  # 把表示 tag 名称的字符串转换成 tag 数组，
  # 不存在的 tag 就创建它
  def self.tag_values_to_tags(user,tag_str)
    tag_values = tag_str.strip.split(/[ ,，]+/)
    tag_values.collect do |value|
      Tag.find_or_create_by_value_and_user_id(value,user.id)
    end
  end

  # 得到该tag所涉及的所有对象
  def targets
    Tagging.find_all_by_tag_id(self.id).map { |tagging| tagging.taggable }
  end

  # 改变tag的值
  # 构建tag数组，有则找出，无则创建
  # 找到以前引用这个 tag 的 tagging，取出关联键值，然后删除这个tagging
  # 根据tag变化创建新的tagging
  def change_value_to(tags_str)
    tags = Tag.tag_values_to_tags(self.user,tags_str)
    taggings = self.taggings
    taggings.each do |tagging|
      taggable_id,taggable_type = tagging.taggable_id,tagging.taggable_type
      tagging.destroy
      tags.each do |tag|
        tagging = Tagging.find(:first,:conditions=>[
            'taggable_id = ? and taggable_type = ? and tag_id = ?',taggable_id,taggable_type,tag.id
          ])
        if tagging.blank?
          Tagging.create({
              :taggable_id=>taggable_id,
              :taggable_type=>taggable_type,
              :tag=>tag
            })
        end
      end
    end
  end

  # 改变tag的值
  def value_str=(str)
    change_value_to(str)
  end

  # 把某用户对于某 taggable对象的 TAGs标注 的关联对象（tagging），保存到数据库
  # 无论什么情况下都保存，无论是否出现重复
  # 所以单独调用时可能会导致重复创建tagging对象
  # 一般不建议单独使用
  def self.create_taggings_of_tags_and_taggable!(tags,taggable)
    tags.each do |tag|
      Tagging.create!({:tag=>tag,:taggable=>taggable})
    end
  end

  # 这个tag被这个人使用的次数
  def used_times_by_user(user)
    self.taggings.of_user(user).count
  end

  # 与tag之相关的tags
  def related_tags
    related_taggings = Tagging.related_of(self)
    tags = related_taggings.map{|tagging|tagging.tag}.compact.uniq
    tags.delete(self)
    tags
  end

  def self.merge_tags_of_user(tags,value,user)
    tags.each do |tag|
      tag.change_value_to(value)
    end
  end

  module TaggableMethods
    def self.included(base)
      base.has_many :taggings,:as=>:taggable
      base.has_many :tags,:through => :taggings,:source=>:tag,:uniq=>true

      base.validates_presence_of :tags_input_user, :if=>Proc.new {|x| !x.tags_input_str.nil?}

      base.after_save :set_tags_after_save

      base.named_scope :tagged_of,lambda { |user,tag|
        return {
          :joins=>"left join taggings on taggings.taggable_id = #{base.table_name}.id and taggings.taggable_type = '#{base.name}'",
          :conditions=>['taggings.tag_id = ? and taggings.user_id = ?',tag.id,user.id]
        }
      }

      base.send(:include,InstanceMethods)
      base.send(:extend,ClassMethods)
    end

    attr_accessor :tags_input_str
    attr_accessor :tags_input_user

    module ClassMethods
      # 得到user在这个类中定义的所有tags
      def tags_of(user,scope={})
        taggings = Tagging.type_of(self).of_user(user).all(scope)
        taggings.map{|tagging|tagging.tag}.uniq
      end
    end

    module InstanceMethods
      # 在保存对象时，根据当前对象上传入的
      # tags_input_user 给对象标注这些TAGs的用户
      # tags_input_str 要给对象标注的tags
      # 该方法主要用于controller中
      def set_tags_after_save
        if(!self.tags_input_user.blank? && !self.tags_input_str.nil?)
          self.set_user_tags!(self.tags_input_user,self.tags_input_str)
        end
        return true
      end

      # 清除一个对象上 user 的 tag 关联
      def clear_taggings_of(user)
        self.taggings.of_user(user).each{|tagging|tagging.destroy}
      end

      # 设置某用户对于当前对象的TAGs，并立即保存到数据库
      def set_user_tags!(user,tags_str)
        # 删除以前的 tagging 关联
        self.clear_taggings_of(user)
        # 增加 TAG
        self.add_tag(user,tags_str)
        return tags
      end

      # 所有tag的字符串
      def tags_str
        self.tags.collect {|tag| tag.value}*","
      end

      # 某人的关于该对象的所有tag的字符串
      def tags_str_of(user)
        self.tags.of_user(user).collect{|x| x.value}*','
      end

      # 给目标对象引用一个标签，如果引用过就不在引用了
      def add_tag(user,tags_str)
        tags = Tag.tag_values_to_tags(user,tags_str)
        tags.each do |tag|
          if !self.taggings.find_by_tag_id(tag.id)
            Tagging.create!({:tag=>tag,:taggable=>self})
          end
        end
      end

      # 去掉从 对象身上 去掉 tags
      def remove_tag(user,tags_str)
        tags = Tag.tag_values_to_tags(user,tags_str)
        tags.each do |tag|
          tagging = self.taggings.find_by_tag_id(tag.id)
          if !tagging.blank?
            tagging.destroy
          end
        end
      end
      
    end
  end

  module UserMethods
    def self.included(base)
      base.has_many :tags
    end

    # 返回当前用户的所有TAGs的字符串，以逗号分隔
    def tags_str
      self.tags.collect(){|tag| tag.value}*","
    end
  end
end

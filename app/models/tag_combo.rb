# == Schema Information
# Schema version: 20091223090135
#
# Table name: tag_combos
#
#  id         :integer(4)      not null, primary key
#  name       :string(255)     default(""), not null
#  creator_id :integer(4)      not null
#  created_at :datetime        
#  updated_at :datetime        
#

class TagCombo < ActiveRecord::Base
  belongs_to :creator,:class_name => "User",:foreign_key => "creator_id"

  has_many :combo_links
  has_many :tags, :through => :combo_links

  validates_presence_of :name
  validates_presence_of :creator

  # 根据tags_combo查找对象
  # 根据tags_combo中的所有tag，分别找到所关联的对象，并取得并集
  def targets
    self.tags.inject([]) do |targets,tag|
      targets = targets | tag.targets
    end
  end

  # 根据多个 tag 创建一个 tag_combo
  def self.pack(tags)
    TagCombo.new(:tags=>tags)
  end

  def self.create_with_tags(params,user)
    tag_combo = TagCombo.new(params[:tag_combo])
    tags = Tag.find(params[:tag_ids])
    tag_combo.tags = tags
    tag_combo.creator = user
    if tag_combo.save
      return tag_combo
    end
    return tag_combo
  end

  # 判断self是否包含另一个tag_combo
  def include?(tag_combo)
    return (self.tags | tag_combo.tags) == self.tags
  end

  # 判断self是否被另一个tag_combo包含
  def in?(tag_combo)
    tag_combo.include?(self)
  end

  # 根据多个 tag_combo 创建一个新的 tag_combo
  def self.merge(tag_combos)
    total_tags = tag_combos.inject([]) do |all_tags,tag_combo|
      all_tags = (tag_combo.tags | all_tags)
    end
    self.pack(total_tags)
  end

  module UserMethods
    def self.included(base)
      base.has_many :tag_combos,:foreign_key => "creator_id"
    end
  end
  
end

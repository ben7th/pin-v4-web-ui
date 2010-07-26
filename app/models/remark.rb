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

class Remark < ActiveRecord::Base
  belongs_to :creator,:class_name => "User", :foreign_key => "creator_id"
  belongs_to :markable,:polymorphic => true

  validates_presence_of :creator
  validates_presence_of :markable

  def reply_user
    if reply_to
      return User.find(reply_to)
    end
  end

  module RemarkMethod
    
    def self.included(base)
      base.has_many :image_marks,:as=>:markable,:class_name=>"Remark::ImageMark"
      base.has_many :remarks,:as=>:markable
    end
    
    # 为 该资源 添加评注。成功的前提是：这个用户有权限这么做
    # user 表示 用户
    # content 表示 评注内容
    def add_remark_comment(user,content)
      Remark::Comment.create(:markable=>self,:creator=>user,:content=>content)
    end
    
    # 创建一个下划线的批注
    # 段落 :paragraph_number，开始位置 :from
    # 结束为止 :to，版本号  :version => 1,
    # 评注体 :markable，创建者 :creator => lifei
    def add_underline_remark(attributes)
      two_point_remark(attributes,Remark::Underline)
    end

    # 创建一个高亮批注
    def add_high_light_remark(attributes)
      two_point_remark(attributes,Remark::HighLight)
    end

    # 创建一个 删除批注
    def add_delete_remark(attributes)
      two_point_remark(attributes,Remark::Delete)
    end

    # 定义一个方法，供 点到点批注使用
    def two_point_remark(attributes,clazz)
      clazz.create!(attributes)
    end

    # 创建一个 插入批注
    #      :paragraph_number => 2,
    #      :begin_point => 2,
    #      :version => 1,
    #      :markable => text_entry,
    #      :creator => lifei,
    #      :content => 'haha'
    def add_insert_remark(attributes)
      Remark::Insert.create!(attributes)
    end

    # 创建一个 段落总评批注（对勾，半对勾，叉）
    #      :paragraph_number => 2,
    #      :version => 1,
    #      :markable => text_entry,
    #      :creator => lifei,
    #      :symbol => "CORRECT" # 段落标注，对勾=>CORRECT, 半对=>HALF_CORRECT, 错误=>ERROR
    def add_paragraph_valuate_remark(attributes)
      Remark::ParagraphValuate.create!(attributes)
    end

  end
  
end

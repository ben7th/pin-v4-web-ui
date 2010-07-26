# == Schema Information
# Schema version: 20091223090135
#
# Table name: taggings
#
#  id            :integer(4)      not null, primary key
#  tag_id        :integer(4)      
#  taggable_id   :integer(4)      
#  taggable_type :string(255)     
#  user_id       :integer(4)      not null
#  created_at    :datetime        
#  updated_at    :datetime        
#

class Tagging < ActiveRecord::Base  
  belongs_to :tag
  belongs_to :taggable,:polymorphic=>true

  named_scope :type_of,lambda { |kclass|
    table_name = kclass.table_name
    str = ""
    if kclass.column_names.include?("deleted_at")
      str = "taggings.taggable_type = '#{kclass.to_s}' AND #{table_name}.deleted_at is null"
    else
      str = "taggings.taggable_type = '#{kclass.to_s}'"
    end
    {
      :joins=>[
        "LEFT JOIN #{table_name} ON #{table_name}.id = taggings.taggable_id",
      ],
      :conditions=>str
    }
  }

  named_scope :of_user,lambda { |user|
    {
      :joins=>"inner join tags on tags.id = taggings.tag_id",
      :conditions=>"tags.user_id = #{user.id}"
    }
  }

  named_scope :related_of,lambda { |tag|
    {
      :joins=>%`
        INNER JOIN taggings t1
        ON taggings.taggable_id = t1.taggable_id
        AND taggings.taggable_type = t1.taggable_type
        AND taggings.id <> t1.id
      `,
      :conditions=>['t1.tag_id = ?',tag.id]
    }
  }

  def self.find_by_tags(tags)
    taggables = tags.map do |tag|
      tag.taggings.map{|tagging|tagging.taggable}.uniq.compact
    end
    array = taggables.shift
    taggables.each do |taggable_temp|
      array = array & taggable_temp
    end
    array
  end
end

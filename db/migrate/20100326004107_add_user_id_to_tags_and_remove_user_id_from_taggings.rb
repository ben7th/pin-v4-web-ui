class AddUserIdToTagsAndRemoveUserIdFromTaggings < ActiveRecord::Migration
  def self.up
    add_column :tags,:user_id,:integer,:null=>false
    remove_column :taggings,:user_id
  end

  def self.down
    remove_column :tags,:user_id
    add_column :taggings,:user_id,:integer,:null=>false
  end
end

class AddKindTypeInterComments < ActiveRecord::Migration
  def self.up
    add_column :teaching_inter_comments,:kind,:string,:null=>false
    add_column :teaching_inter_comments,:rand_count,:integer
  end

  def self.down
    remove_column(:teaching_inter_comments, :kind)
    remove_column(:teaching_inter_comments, :rand_count)
  end
end

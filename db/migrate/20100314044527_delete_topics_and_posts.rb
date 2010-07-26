class DeleteTopicsAndPosts < ActiveRecord::Migration
  def self.up
    drop_table :topics
    drop_table :posts
  end

  def self.down
  end
end

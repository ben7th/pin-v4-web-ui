class DeleteStatusAddDeletedAtToTopicsAndPosts < ActiveRecord::Migration
  def self.up
    remove_column(:topics, :status)
    remove_column(:posts, :status)
    add_column :topics,:deleted_at,:datetime
    add_column :posts,:deleted_at,:datetime
  end

  def self.down
  end
end

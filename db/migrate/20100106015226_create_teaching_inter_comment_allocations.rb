class CreateTeachingInterCommentAllocations < ActiveRecord::Migration
  def self.up
    create_table :teaching_inter_comment_allocations do |t|
      t.integer :inter_comment_id
      t.integer :execution_id,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_inter_comment_allocations
  end
end

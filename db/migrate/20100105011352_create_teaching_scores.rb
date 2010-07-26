class CreateTeachingScores < ActiveRecord::Migration
  def self.up
    create_table :teaching_scores do |t|
      t.integer :execution_id, :null=>false
      t.integer :creator_id, :null=>false
      t.float :score,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_scores
  end
end

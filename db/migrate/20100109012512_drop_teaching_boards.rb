class DropTeachingBoards < ActiveRecord::Migration
  def self.up
    drop_table :teaching_boards
  end

  def self.down
  end
end

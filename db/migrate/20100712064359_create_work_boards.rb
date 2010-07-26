class CreateWorkBoards < ActiveRecord::Migration
  def self.up
    create_table :work_boards do |t|
      t.integer :user_id
      t.timestamps
    end
  end

  def self.down
    drop_table :work_boards
  end
end

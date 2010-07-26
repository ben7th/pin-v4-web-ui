class CreateTeachingBoards < ActiveRecord::Migration
  def self.up
    create_table :teaching_boards do |t|
      t.string :name, :null=>false
      t.integer :procedure_id, :null=>false
      t.timestamps
    end
    add_index(:teaching_boards, :procedure_id)
  end

  def self.down
    drop_table :teaching_boards
  end
end

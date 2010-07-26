class CreateWorkBoardQuotings < ActiveRecord::Migration
  def self.up
    create_table :work_board_quotings do |t|
      t.integer :work_board_id
      t.integer :entry_id
      t.timestamps
    end
  end

  def self.down
    drop_table :work_board_quotings
  end
end

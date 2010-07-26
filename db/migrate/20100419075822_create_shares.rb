class CreateShares < ActiveRecord::Migration
  def self.up
    create_table :shares do |t|
      t.integer :entry_id
      t.integer :creator_id
      t.timestamps
    end
    add_index :shares, :entry_id
    add_index :shares, :creator_id
  end

  def self.down
    drop_table :shares
  end
end

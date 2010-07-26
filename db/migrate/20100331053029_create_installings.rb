class CreateInstallings < ActiveRecord::Migration
  def self.up
    create_table :installings do |t|
      t.integer :user_id
      t.integer :app_id
      t.timestamps
    end
    add_index :installings,:user_id
    add_index :installings,:app_id
  end

  def self.down
    drop_table :installings
  end
end

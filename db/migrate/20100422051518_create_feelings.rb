class CreateFeelings < ActiveRecord::Migration
  def self.up
    create_table :feelings do |t|
      t.integer :feelable_id
      t.string :feelable_type
      t.integer :user_id
      t.string :evaluation
      t.timestamps
    end
  end

  def self.down
    drop_table :feelings
  end
end

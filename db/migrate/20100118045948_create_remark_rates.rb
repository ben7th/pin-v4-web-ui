class CreateRemarkRates < ActiveRecord::Migration
  def self.up
    create_table :remark_rates do |t|
      t.integer :user_id,:null=>false
      t.integer :rateable_id,:null=>false
      t.string :rateable_type,:null=>false
      t.integer :rate
      t.timestamps
    end
  end

  def self.down
    drop_table :remark_rates
  end
end

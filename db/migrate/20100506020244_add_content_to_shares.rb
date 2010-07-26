class AddContentToShares < ActiveRecord::Migration
  def self.up
    add_column :shares,:content,:text
  end

  def self.down
  end
end

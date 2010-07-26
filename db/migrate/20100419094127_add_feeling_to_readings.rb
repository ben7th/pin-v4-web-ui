class AddFeelingToReadings < ActiveRecord::Migration
  def self.up
    add_column :readings,:feeling,:string
  end

  def self.down
    remove_column :readings,:feeling
  end
end

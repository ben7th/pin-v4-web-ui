class RemoveFeelingFromReadings < ActiveRecord::Migration
  def self.up
    remove_column(:readings,:feeling )
  end

  def self.down
  end
end

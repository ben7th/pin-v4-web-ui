class AddUnreadToMessageReadings < ActiveRecord::Migration
  def self.up
    add_column :message_readings,:unread,:boolean,:default =>true
  end

  def self.down
  end
end

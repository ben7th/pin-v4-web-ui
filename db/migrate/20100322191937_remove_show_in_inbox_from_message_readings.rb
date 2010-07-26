class RemoveShowInInboxFromMessageReadings < ActiveRecord::Migration
  def self.up
    remove_column :message_readings,:show_in_inbox
  end

  def self.down
  end
end

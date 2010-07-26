class AddShowInInboxToMessageReading < ActiveRecord::Migration
  def self.up
    add_column :message_readings,:show_in_inbox,:boolean,:null=>false
  end

  def self.down
  end
end

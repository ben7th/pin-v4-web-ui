class MakeMessageReadingAndMessageHiddenNotNull < ActiveRecord::Migration
  def self.up
    change_column :message_readings, :hidden, :boolean, :null => false
    change_column :messages, :hidden, :boolean, :null => false
  end

  def self.down
  end
end

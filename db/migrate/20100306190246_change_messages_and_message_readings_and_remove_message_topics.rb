class ChangeMessagesAndMessageReadingsAndRemoveMessageTopics < ActiveRecord::Migration
  def self.up
    drop_table :message_topics
    remove_column(:message_readings, :message_topic_id)
    add_column :message_readings,:message_id,:integer,:null=>false
    remove_column(:messages,[:message_topic_id,:reply_to])
    add_column :messages,:parent_id,:integer
    add_column :messages,:lft,:integer
    add_column :messages,:rgt,:integer
  end

  def self.down
  end
end

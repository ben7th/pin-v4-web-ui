class AddReplyToAndTitleToMessages < ActiveRecord::Migration
  def self.up
    add_column :messages,:reply_to,:integer
    add_column :messages,:title,:string,:null=>false
  end

  def self.down
  end
end

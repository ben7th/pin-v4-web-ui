class ChangContentToTextAreaToMessages < ActiveRecord::Migration
  def self.up
    change_column :messages,:content,:text
  end

  def self.down
  end
end

class AddReplyToToRemarks < ActiveRecord::Migration
  def self.up
    add_column :remarks,:reply_to,:integer
  end

  def self.down
  end
end

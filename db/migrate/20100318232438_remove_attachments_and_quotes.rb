class RemoveAttachmentsAndQuotes < ActiveRecord::Migration
  def self.up
    drop_table :attachments
    drop_table :quotes
  end

  def self.down
  end
end

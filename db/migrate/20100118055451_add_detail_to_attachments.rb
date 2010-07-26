class AddDetailToAttachments < ActiveRecord::Migration
  def self.up
    add_column :attachments,:detail,:string,:default=>"Min"
  end

  def self.down
  end
end

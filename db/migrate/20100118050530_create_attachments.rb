class CreateAttachments < ActiveRecord::Migration
  def self.up
    create_table :attachments do |t|
      t.string :host_type,:null=>false
      t.integer :host_id,:null=>false
      t.integer :entry_id,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :attachments
  end
end

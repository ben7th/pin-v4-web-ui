class CreateContacts < ActiveRecord::Migration
  def self.up
    create_table :contacts do |t|
      t.integer :host_id
      t.integer :friend_id
      t.timestamps
    end
    add_index :contacts, :host_id
    add_index :contacts, :friend_id
  end

  def self.down
    drop_table :contacts
  end
end

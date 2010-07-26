class CreateInvitations < ActiveRecord::Migration
  def self.up
    create_table :invitations do |t|
      t.integer :host_id
      t.string :friend_email
      t.string :uuid
      t.timestamps
    end
    add_index :invitations, :host_id
  end

  def self.down
    drop_table :invitations
  end
end

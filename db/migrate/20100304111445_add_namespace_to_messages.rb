class AddNamespaceToMessages < ActiveRecord::Migration
  def self.up
    add_column :messages,:namespace,:string,:default=>'site_mail'
  end

  def self.down
    remove_column(:messages, :namespace)
  end
end

class RenameContactToContacting < ActiveRecord::Migration
  def self.up
    rename_table('contacts', 'contactings')
  end

  def self.down
  end
end

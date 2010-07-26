class AddForbiddenToEntries < ActiveRecord::Migration
  def self.up
    add_column :entries,:forbidden, :boolean
  end

  def self.down
    remove_column(:entries, :forbidden)
  end
end

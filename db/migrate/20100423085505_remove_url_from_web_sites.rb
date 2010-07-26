class RemoveUrlFromWebSites < ActiveRecord::Migration
  def self.up
    remove_column :web_sites,:url
  end

  def self.down
  end
end

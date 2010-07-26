class RenameWebSiteIntroductions < ActiveRecord::Migration
  def self.up
    rename_table :web_site_introductions, :introductions
  end

  def self.down
  end
end

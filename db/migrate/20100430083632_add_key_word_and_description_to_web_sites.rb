class AddKeyWordAndDescriptionToWebSites < ActiveRecord::Migration
  def self.up
    add_column :web_sites, :key_words, :string
    add_column :web_sites, :description, :string
  end

  def self.down
    remove_column :web_sites, :key_words
    remove_column :web_sites, :description
  end
end

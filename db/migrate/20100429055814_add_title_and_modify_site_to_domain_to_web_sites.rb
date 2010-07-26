class AddTitleAndModifySiteToDomainToWebSites < ActiveRecord::Migration
  def self.up
    add_column :web_sites,:title,:string
    rename_column(:web_sites, :site, :domain)
  end

  def self.down
    remove_column(:web_sites, :title)
    rename_column(:web_sites, :domain, :site)
  end
end

class CreateWebSites < ActiveRecord::Migration
  def self.up
    create_table :web_sites do |t|
      t.string :url
      t.string :site
      t.timestamps
    end
  end

  def self.down
    drop_table :web_sites
  end
end

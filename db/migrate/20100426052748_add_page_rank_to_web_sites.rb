class AddPageRankToWebSites < ActiveRecord::Migration
  def self.up
    add_column :web_sites,:page_rank,:integer
  end

  def self.down
  end
end

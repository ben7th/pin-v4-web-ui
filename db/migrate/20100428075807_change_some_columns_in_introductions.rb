class ChangeSomeColumnsInIntroductions < ActiveRecord::Migration
  def self.up
    rename_column :introductions,:web_site_id,:introductable_id
    add_column :introductions,:introductable_type,:string
  end

  def self.down
  end
end

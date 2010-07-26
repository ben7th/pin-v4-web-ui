class CreateWebSiteIntroductions < ActiveRecord::Migration
  def self.up
    create_table :web_site_introductions do |t|
      t.integer :version
      t.integer :user_id
      t.integer :web_site_id
      t.boolean :checked
      t.text :content
      t.timestamps
    end
  end

  def self.down
    drop_table :web_site_introductions
  end
end

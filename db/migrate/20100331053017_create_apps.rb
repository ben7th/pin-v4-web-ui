class CreateApps < ActiveRecord::Migration
  def self.up
    create_table :apps do |t|
      t.string :name
      t.string :title
      t.string :callback_url
      t.integer :port,:default=>80
      t.string :secret_key
      t.timestamps
    end
    add_index :apps, :name
  end

  def self.down
    drop_table :apps
  end
end

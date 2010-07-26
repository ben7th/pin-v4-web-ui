class CreateBookmarkEntries < ActiveRecord::Migration
  def self.up
    create_table :bookmark_entries do |t|
      t.string :url
      t.string :site
      t.timestamps
    end
  end

  def self.down
    drop_table :bookmark_entries
  end
end

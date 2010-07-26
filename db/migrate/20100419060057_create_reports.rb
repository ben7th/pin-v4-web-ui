class CreateReports < ActiveRecord::Migration
  def self.up
    create_table :reports do |t|
      t.integer :entry_id
      t.text :content
      t.timestamps
    end
    add_index(:reports, :entry_id)
  end

  def self.down
    drop_table :reports
  end
end

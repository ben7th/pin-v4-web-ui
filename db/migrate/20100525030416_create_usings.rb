class CreateUsings < ActiveRecord::Migration
  def self.up
    create_table :usings do |t|
      t.integer :share_id
      t.integer :entry_id
      t.timestamps
    end
    add_index(:usings, :share_id)
    add_index(:usings, :entry_id)
  end

  def self.down
    drop_table :usings
  end
end

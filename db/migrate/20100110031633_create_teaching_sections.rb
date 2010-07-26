class CreateTeachingSections < ActiveRecord::Migration
  def self.up
    create_table :teaching_sections do |t|
      t.string :name,:null=>false
      t.integer :parent_id,:null=>false
      t.string :parent_type,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_sections
  end
end

class CreateTeachingUnits < ActiveRecord::Migration
  def self.up
    create_table :teaching_units do |t|
      t.string :name, :null=>false
      t.text :subject
      t.integer :teaching_lesson_id, :null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_units
  end
end

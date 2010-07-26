class CreateTeachingProcedures < ActiveRecord::Migration
  def self.up
    create_table :teaching_procedures do |t|
      t.string :name,:null=>false
      t.text :subject
      t.integer :creator_id, :null=>false
      t.integer :teaching_unit_id, :null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_procedures
  end
end

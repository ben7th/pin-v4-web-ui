class CreateTeachingReferences < ActiveRecord::Migration
  def self.up
    create_table :teaching_references do |t|
      t.integer :procedure_id, :null=>false
      t.integer :source_id,:null=>false
      t.string :source_type, :null=>false
      t.timestamps
    end
    add_index(:teaching_references, :source_id)
    add_index(:teaching_references, [:source_type, :procedure_id])
  end

  def self.down
    drop_table :teaching_references
  end
end

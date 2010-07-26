class ChangeTeachingInterCommentsProcedureIdToRequirementId < ActiveRecord::Migration
  def self.up
    rename_column :teaching_inter_comments,:procedure_id,:requirement_id
  end

  def self.down
  end
end
